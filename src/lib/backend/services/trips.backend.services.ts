import { ChatCompletionRequestMessage } from "openai-edge";
import { array } from "yup";
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
  DistanceMatrixResponseSchemaType,
  distanceSchema,
  durationSchema,
} from "../../schema/distance-matrix-api.schema";
import { ChatGptTripItineraryResponseType } from "../../schema/open-ai.schema";
import { GooglePlaceDetailResponseType } from "../../schema/place-details.schema";
import { TripModalSchemaType, tripModalSchema } from "../../schema/trip.schema";
import {
  getTripsFromCache,
  getTripsLengthInCache,
  putTripsInCache,
} from "../cache/trips.cache";
import {
  getDistanceMatrixBetweenPlacesParallel,
  getPlaceDetailsWithImageParallel,
} from "./google.backend.services";
import { getPlaceDetail } from "./places.backend.services";

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
    daysDoc?.docs?.map((day) => dayModalSchema.validateSync(day.data())) || [];
  const allPlaces =
    Object.values(daysDetails)
      ?.map((day) => day?.activities?.map((activity) => activity.placeId))
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
      getPlaceDetailsWithImageParallel(
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
