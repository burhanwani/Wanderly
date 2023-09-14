import { InferType } from "yup";
import firebaseAdmin from "../../config/firebase/firebase-admin.config";
import { Collections } from "../../constants/firebase.constants";
import { RESPONSE_CONSTANTS } from "../../constants/response.constants";
import { DayModalSchemaType, dayModalSchema } from "../../schema/day.schema";
import {
  getDayFromCache,
  putDayInCache,
  putDaysInCache,
} from "../cache/days.cache";

export async function updateDayActivity(
  userId: string,
  validatedPayload: InferType<typeof dayModalSchema>
) {
  const db = firebaseAdmin.firestore();
  const day = await getDayFromFirebaseOrCache(validatedPayload.dayId, db);
  if (day) {
    if (day?.userId != userId) {
      return RESPONSE_CONSTANTS[401];
    }
    if (day?.tripId != validatedPayload.tripId) {
      return RESPONSE_CONSTANTS[401];
    }
    await updateFirebaseAndCache(day, db);
    return RESPONSE_CONSTANTS[200]();
  } else {
    return RESPONSE_CONSTANTS[400];
  }
}

export async function getDays(tripId: string) {
  const db = firebaseAdmin.firestore();
  const daysDoc = await db
    .collection(Collections.DAYS)
    .where("tripId", "==", tripId)
    .get();
  const daysDetails =
    daysDoc?.docs?.map((day) => dayModalSchema.validateSync(day.data())) || [];
  await putDaysInCache(daysDetails);
  return daysDetails;
}

async function getDayFromFirebaseOrCache(
  dayId: string,
  db = firebaseAdmin.firestore()
) {
  const day = await getDayFromCache(dayId);
  if (day) return day;
  const dayDoc = await db.collection(Collections.DAYS).doc(dayId).get();
  return dayModalSchema.nullable().validateSync(dayDoc.data());
}

async function updateFirebaseAndCache(
  day: DayModalSchemaType,
  db = firebaseAdmin.firestore()
) {
  await putDayInCache(day);
  await db.collection(Collections.DAYS).doc(day.dayId).update(day);
}
