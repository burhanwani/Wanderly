import { getServerSession } from "next-auth";
import { array } from "yup";
import { nextAuthOptions } from "../../../../../lib/config/auth/next-auth.config";
import firebaseAdmin from "../../../../../lib/config/firebase/firebase-admin.config";
import {
  getTripsFromCache,
  putTripsInCache,
} from "../../../../../lib/config/upstash/upstash-redis.config";
import { Collections } from "../../../../../lib/constants/firebase.constants";
import { RESPONSE_CONSTANTS } from "../../../../../lib/constants/response.constants";
import { tripModalSchema } from "../../../../../lib/schema/trip.schema";

export async function GET() {
  const session = await getServerSession(nextAuthOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return RESPONSE_CONSTANTS[401];
  }
  try {
    const trips = await getTrips(userId);
    return RESPONSE_CONSTANTS[200](trips);
  } catch (err) {
    return RESPONSE_CONSTANTS[500](
      "Something went wrong while fetching trips."
    );
  }
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
