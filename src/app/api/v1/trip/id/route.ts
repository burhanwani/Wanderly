import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { ValidationError } from "yup";
import {
  BETA_LIMIT_EMAIL_WHITE_LIST,
  isBetaLimitReached,
} from "../../../../../lib/config/app/app.config";
import { nextAuthOptions } from "../../../../../lib/config/auth/next-auth.config";
import firebaseAdmin from "../../../../../lib/config/firebase/firebase-admin.config";
import { Collections } from "../../../../../lib/constants/firebase.constants";
import { RESPONSE_CONSTANTS } from "../../../../../lib/constants/response.constants";
import { dayModalSchema } from "../../../../../lib/schema/day.schema";
import {
  tripIdParamSchema,
  tripModalSchema,
} from "../../../../../lib/schema/trip.schema";
import { getPlaceDetail } from "../../google/place/route";
import { getTrips } from "../all/route";

export async function POST(req: NextRequest) {
  const session = await getServerSession(nextAuthOptions);
  const userId = session?.user?.id;
  if (!userId) return RESPONSE_CONSTANTS[401];
  const { tripId = null } = await req.json();
  try {
    const data = await tripIdParamSchema.validate(tripId);
    const trips = await getTrips(userId);
    if (
      isBetaLimitReached(trips?.length) &&
      BETA_LIMIT_EMAIL_WHITE_LIST.includes(session?.user?.email)
    ) {
      return RESPONSE_CONSTANTS[401]("Only 3 trips are allowed in beta");
    }
    const response = await getTrip(tripId, userId);
    if (data == null) {
      return RESPONSE_CONSTANTS["404"]("Trip not found");
    }
    return RESPONSE_CONSTANTS[200](response);
  } catch (err) {
    console.log("error", err);
    if (err instanceof ValidationError)
      return RESPONSE_CONSTANTS[400](err.message);
  }
  return RESPONSE_CONSTANTS[500];
}

async function getTrip(tripId: string, userId: string) {
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
