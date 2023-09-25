import { ChatCompletionRequestMessage } from "openai-edge";
import { array } from "yup";
import { NextDayGenerationSchemaType } from "../../../app/api/v2/trip/next/route";
import { WanderlyVersion } from "../../config/app/app.config";
import firebaseAdmin from "../../config/firebase/firebase-admin.config";
import { Collections } from "../../constants/firebase.constants";
import {
  ChatGptTripBuilderModalSchemaType,
  chatGptTripBuilderModalSchema,
} from "../../schema/chat-gpt-trip-builder.schema";
import {
  ActivityModalSchemaType,
  DayModalSchemaType,
  dayModalSchema,
} from "../../schema/day.schema";
import {
  ActivityModalSchemaTypeV2,
  DayModalSchemaTypeV2,
  dayModalSchemaV2,
} from "../../schema/day.v2.schema";
import {
  DistanceMatrixResponseSchemaType,
  distanceSchema,
  durationSchema,
} from "../../schema/distance-matrix-api.schema";
import { ChatGptTripItineraryResponseType } from "../../schema/open-ai.schema";
import {
  ChatGptTripGeneratorMultipleSchemaV2Type,
  ChatGptTripItineraryResponseTypeV2,
} from "../../schema/open-ai.v2.schema";
import { GooglePlaceDetailResponseType } from "../../schema/place-details.schema";
import { TripModalSchemaType, tripModalSchema } from "../../schema/trip.schema";
import {
  getTripsFromCache,
  getTripsLengthInCache,
  putTripsInCache,
} from "../cache/trips.cache";
import { createBuilder, updateBuilder } from "./builders.backend.services";
import { updateDayFirebaseAndCache } from "./days.backend.services";
import {
  getDistanceMatrixBetweenPlacesParallel,
  getPlaceDetailsFromTextParallel,
} from "./google.backend.services";
import { getPlaceDetail } from "./places.backend.services";

export type GetTripReturnType = Awaited<ReturnType<typeof getTrip>>;

export async function getTrip(tripId: string, userId: string) {
  const db = firebaseAdmin.firestore();
  const tripDoc = await db.collection(Collections.TRIPS).doc(tripId).get();
  if (!tripDoc.exists) {
    return null;
  }
  const tripDetails = tripModalSchema.validateSync(tripDoc.data());
  if (tripDetails.userId != userId) {
    return null;
  }
  const daysDoc = await db
    .collection(Collections.DAYS)
    .where("tripId", "==", tripId)
    .get();
  const daysDetails =
    daysDoc?.docs?.map((day) => dayModalSchemaV2.validateSync(day.data())) ||
    [];
  const allPlaces =
    Object.values(daysDetails)
      ?.map((day) => day?.activities?.map((activity) => activity?.placeId!))
      .flat() || [];
  allPlaces.push(tripDetails?.placeId);
  const placesPromise = allPlaces.map((place) => getPlaceDetail(place));
  placesPromise.push(getPlaceDetail(tripDetails?.placeId));
  const places = await Promise.all(placesPromise);
  return { tripDetails, daysDetails, places: places || [] };
}

export async function getTrips(userId: string) {
  const tripsFromCache = await getTripsFromCache(userId);
  if (tripsFromCache) return tripsFromCache;
  const db = firebaseAdmin.firestore();
  const query = await db
    .collection(Collections.TRIPS)
    .where("userId", "==", userId)
    .get();
  const tripsFromFirebase = query?.docs?.map((doc) => doc.data()) || [];
  const trips = array()
    .of(tripModalSchema)
    .default([])
    .required()
    .validateSync(tripsFromFirebase);
  await putTripsInCache(userId, trips);
  return trips;
}

export async function createTrip(
  days: ChatGptTripItineraryResponseType,
  userId: string,
  placeDetails: GooglePlaceDetailResponseType,
  messages: ChatCompletionRequestMessage[]
) {
  const allDays = Object.values(days);
  const places = await Promise.all(
    allDays.map((activities) =>
      getPlaceDetailsFromTextParallel(
        activities.map((activity) => activity.google_place_name),
        placeDetails?.result?.name
      )
    )
  );
  const distances = await Promise.all(
    places.map((days) => getDistanceMatrixBetweenPlacesParallel(days))
  );

  const { daysDetails, tripDetails } = await createFirebaseTrip(
    days,
    userId,
    placeDetails,
    places,
    distances,
    messages
  );
  return { tripDetails, daysDetails, places: places.flat() };
}

async function createFirebaseTrip(
  days: ChatGptTripItineraryResponseType,
  userId: string,
  placeDetails: GooglePlaceDetailResponseType,
  places: GooglePlaceDetailResponseType[][],
  distances: (DistanceMatrixResponseSchemaType | null)[][],
  messages: ChatCompletionRequestMessage[]
) {
  const daysValues = Object.values(days);
  const db = firebaseAdmin.firestore();
  const tripRef = db.collection(Collections.TRIPS).doc();
  const daysRef = await Promise.all(
    daysValues.map(() => db.collection(Collections.DAYS).doc())
  );
  const daysDetails = daysValues.map((day, dayIndex) => {
    return dayModalSchema.validateSync({
      activities: day.map(
        (activity, activityIndex) =>
          ({
            allocatedTime: activity.allocated_time,
            description: activity.description,
            name: activity.google_place_name,
            time: activity.time,
            placeId: places[dayIndex][activityIndex]?.result?.place_id,
            travel: {
              distance: distanceSchema.validateSync(
                distances?.[dayIndex]?.[activityIndex]?.rows?.[0]?.elements?.[0]
                  ?.distance
              ),
              duration: durationSchema.validateSync(
                distances?.[dayIndex]?.[activityIndex]?.rows?.[0]?.elements?.[0]
                  ?.duration
              ),
            },
            location: {
              lat: places?.[dayIndex]?.[activityIndex]?.result?.geometry
                ?.location?.lat,
              lng: places?.[dayIndex]?.[activityIndex]?.result?.geometry
                ?.location?.lng,
            },
          }) as ActivityModalSchemaType
      ),
      tripId: tripRef.id,
      userId,
      dayId: daysRef[dayIndex].id,
    } as DayModalSchemaType);
  });
  const tripDetails = tripModalSchema.validateSync({
    days: daysRef.map((day) => day.id),
    placeId: placeDetails?.result?.place_id,
    userId,
    tripId: tripRef?.id,
    placeName: placeDetails?.result?.name,
    location: {
      lat: placeDetails?.result?.geometry?.location?.lat,
      lng: placeDetails?.result?.geometry?.location?.lng,
    },
    version: WanderlyVersion.V1,
    // photoReference: placeDetails?.result?.photos?.[0]?.photo_reference,
  } as TripModalSchemaType);
  const messageDetails = chatGptTripBuilderModalSchema.validateSync({
    messages,
    response: days,
    tripId: tripRef?.id,
    userId,
  } as ChatGptTripBuilderModalSchemaType);
  const promises = new Array<Promise<unknown>>();
  promises.push(tripRef.create(tripDetails));
  promises.push(
    db.collection(Collections.BUILDERS).doc().create(messageDetails)
  );

  daysDetails.forEach((day, index) =>
    promises.push(daysRef[index].create(day))
  );
  await Promise.all(promises);
  return { tripDetails, daysDetails };
}

export async function getTripsLength(userId: string) {
  const length = await getTripsLengthInCache(userId);
  if (length) return length;
  const trips = await getTrips(userId);
  return trips?.length || 0;
}

export async function createTripV2(
  days: ChatGptTripItineraryResponseTypeV2,
  userId: string,
  placeDetails: GooglePlaceDetailResponseType,
  messages: ChatCompletionRequestMessage[],
  totalDays: number = 1
) {
  const allDays = Object.values(days);
  const places = await Promise.all(
    allDays.map((activities) =>
      getPlaceDetailsFromTextParallel(
        activities.map((activity) => activity.google_place_name),
        placeDetails?.result?.name
      )
    )
  );
  const distances = await Promise.all(
    places.map((days) => getDistanceMatrixBetweenPlacesParallel(days))
  );

  const { daysDetails, tripDetails } = await createFirebaseTripV2(
    days,
    userId,
    placeDetails,
    places,
    distances,
    messages,
    totalDays
  );
  return {
    tripDetails,
    daysDetails,
    places: places.flat(),
  };
}

async function createFirebaseTripV2(
  days: ChatGptTripItineraryResponseTypeV2,
  userId: string,
  placeDetails: GooglePlaceDetailResponseType,
  places: GooglePlaceDetailResponseType[][],
  distances: (DistanceMatrixResponseSchemaType | null)[][],
  messages: ChatCompletionRequestMessage[],
  totalDays: number = 1
) {
  const allDays = Object.keys(days)
    .sort()
    .map((dayNumber) => days[dayNumber]);
  const db = firebaseAdmin.firestore();
  const tripRef = db.collection(Collections.TRIPS).doc();
  const daysRef = await Promise.all(
    Array.from({ length: totalDays }, () =>
      db.collection(Collections.DAYS).doc()
    )
  );
  console.log("daysRef", daysRef);
  console.log("days", days);
  const daysDetails = daysRef.map((day, dayIndex) => {
    const dayNumber = dayIndex + 1;
    const activities = days[dayNumber]
      ? days[dayNumber]?.map(
          (activity, activityIndex) =>
            ({
              ...activity,
              placeId: places?.[dayIndex]?.[activityIndex]?.result?.place_id,
              duration_details: distances?.[dayIndex]?.[activityIndex],
            }) as ActivityModalSchemaTypeV2
        )
      : [];
    console.log(`activities ${dayNumber}`, activities);
    const dayToReturn = dayModalSchemaV2.validateSync({
      activities,
      tripId: tripRef.id,
      userId,
      dayId: day.id,
      isDayGenerated: activities.length > 0,
    } as DayModalSchemaTypeV2);
    return dayToReturn;
  });

  const tripDetails = tripModalSchema.validateSync({
    days: daysRef.map((day) => day.id),
    placeId: placeDetails?.result?.place_id,
    userId,
    tripId: tripRef?.id,
    placeName: placeDetails?.result?.name,
    location: {
      lat: placeDetails?.result?.geometry?.location?.lat,
      lng: placeDetails?.result?.geometry?.location?.lng,
    },
    version: WanderlyVersion.V2,
    // photoReference: placeDetails?.result?.photos?.[0]?.photo_reference,
  } as TripModalSchemaType);

  const messageDetails = chatGptTripBuilderModalSchema.validateSync({
    messages,
    tripId: tripRef?.id,
    userId,
  } as ChatGptTripBuilderModalSchemaType);
  const promises = new Array<Promise<unknown>>();
  promises.push(tripRef.create(tripDetails));
  promises.push(createBuilder(messageDetails));

  daysDetails.forEach((day, index) =>
    promises.push(daysRef[index].create(day))
  );
  await Promise.all(promises);
  return { tripDetails, daysDetails };
}

export type UpdateNextDayOfTripV2Type = Awaited<
  ReturnType<typeof updateNextDayOfTripV2>
>;

export async function updateNextDayOfTripV2(
  days: ChatGptTripItineraryResponseTypeV2,
  tripDetails: GetTripReturnType,
  payload: NextDayGenerationSchemaType,
  builder: ChatGptTripBuilderModalSchemaType
) {
  const activities = days?.[payload?.dayNumber];
  console.log("activities", activities);
  const places = await getPlaceDetailsFromTextParallel(
    activities.map((activity) => activity.google_place_name),
    tripDetails?.tripDetails?.placeName
  );

  const distances = await getDistanceMatrixBetweenPlacesParallel(places);
  return updateFirebaseTripV2(
    activities,
    tripDetails,
    payload,
    places,
    distances,
    builder
  );
}

async function updateFirebaseTripV2(
  activities: ChatGptTripGeneratorMultipleSchemaV2Type,
  tripDetails: GetTripReturnType,
  payload: NextDayGenerationSchemaType,
  places: GooglePlaceDetailResponseType[],
  distances: (DistanceMatrixResponseSchemaType | null)[],
  builder: ChatGptTripBuilderModalSchemaType
) {
  const db = firebaseAdmin.firestore();
  const dayDetails = tripDetails?.daysDetails?.find(
    (day) => day.dayId == payload.dayId
  );
  if (!dayDetails) throw new Error("Day not found");

  const activitiesToAppend = activities?.map(
    (activity, activityIndex) =>
      ({
        ...activity,
        placeId: places?.[activityIndex]?.result?.place_id,
        duration_details: distances?.[activityIndex],
      }) as ActivityModalSchemaTypeV2
  );
  console.log("activitiesToAppend", activitiesToAppend);
  const dayToReturn = dayModalSchemaV2.validateSync({
    ...dayDetails,
    activities: activitiesToAppend,
    isDayGenerated: activities.length > 0,
  } as DayModalSchemaTypeV2);
  console.log("dayToReturn", dayToReturn);
  const messageDetails = chatGptTripBuilderModalSchema.validateSync(builder);
  const promises = new Array<Promise<unknown>>();
  promises.push(updateBuilder(messageDetails));
  promises.push(updateDayFirebaseAndCache(dayToReturn, db, dayToReturn));
  const data = await Promise.all(promises);
  console.log("data", data);
  return { dayDetail: dayToReturn, places };
}
