import { InferType, array } from "yup";
import firebaseAdmin from "../../config/firebase/firebase-admin.config";
import { logError, logInfo } from "../../config/logger/logger.config";
import { Collections } from "../../constants/firebase.constants";
import { RESPONSE_CONSTANTS } from "../../constants/response.constants";
import {
  DayModalSchemaTypeV2,
  activityModalSchemaV2,
  dayModalSchemaV2,
} from "../../schema/day.v2.schema";
import {
  getDayFromCache,
  putDayInCache,
  putDaysInCache,
} from "../cache/days.cache";
import {
  getDistanceMatrixBetweenPlacesParallel,
  getPlaceDetailsParallel,
} from "./google.backend.services";

export async function updateDayActivity(
  userId: string,
  validatedPayload: InferType<typeof dayModalSchemaV2>,
) {
  const db = firebaseAdmin.firestore();
  const day = await getDayFromFirebaseOrCache(validatedPayload.dayId, db);
  if (day) {
    if (day?.userId != userId) {
      logError("Update Activity | Updating others activity", userId);
      return RESPONSE_CONSTANTS[401]();
    }
    if (day?.tripId != validatedPayload.tripId) {
      logError(
        `Update Activity | Updating others | trip id : ${validatedPayload.tripId}`,
        userId,
      );
      return RESPONSE_CONSTANTS[401]();
    }

    if (day?.startTime != validatedPayload.startTime) {
      await updateDayFirebaseAndCache(validatedPayload, db, {
        startTime: validatedPayload.startTime,
      });
      logInfo(
        `Update Activity | start time | day id : ${validatedPayload.dayId}`,
        userId,
      );
      return RESPONSE_CONSTANTS[200](validatedPayload);
    }
    if (isActivitiesDraggedAndDropped(day, validatedPayload)) {
      const newActivities = validatedPayload.activities;
      const places = await getPlaceDetailsParallel(
        (newActivities || []).map((activity) => activity?.placeId!),
      );
      const distances = await getDistanceMatrixBetweenPlacesParallel(places);
      const activitiesToUpdate = newActivities.map((activity, index) => ({
        ...activity,
        duration_details: distances[index],
      }));
      const validatedActivities = array()
        .of(activityModalSchemaV2)
        .default([])
        .min(0)
        .required()
        .validateSync(activitiesToUpdate);
      await updateDayFirebaseAndCache(validatedPayload, db, {
        activities: validatedActivities,
      });
      logInfo(
        `Updated Activity | Drag and Drop | day id : ${validatedPayload.dayId}`,
        userId,
      );
      return RESPONSE_CONSTANTS[200]({
        ...validatedPayload,
        activities: validatedActivities,
      });
    }
    logInfo(
      `Updated Activity | Others | day id : ${validatedPayload.dayId}`,
      userId,
    );
    await updateDayFirebaseAndCache(validatedPayload, db, validatedPayload);
    return RESPONSE_CONSTANTS[200](validatedPayload);
  } else {
    logError(
      `Update Activity | Day Not Found | day Id : ${validatedPayload.dayId}`,
      userId,
    );
    return RESPONSE_CONSTANTS[400]();
  }
}

function isActivitiesDraggedAndDropped(
  day: DayModalSchemaTypeV2,
  newDay: DayModalSchemaTypeV2,
) {
  const oldActivitiesArrangement = getActivityPlaceIdCustomHash(
    day?.activities,
  );
  const newActivitiesArrangement = getActivityPlaceIdCustomHash(
    newDay?.activities,
  );
  return oldActivitiesArrangement != newActivitiesArrangement;
}

function getActivityPlaceIdCustomHash(
  activities: DayModalSchemaTypeV2["activities"] = [],
) {
  return activities?.map((activity) => activity.placeId).join("");
}

export async function getDays(tripId: string) {
  const db = firebaseAdmin.firestore();
  const daysDoc = await db
    .collection(Collections.DAYS)
    .where("tripId", "==", tripId)
    .get();
  const daysDetails =
    daysDoc?.docs?.map((day) => dayModalSchemaV2.validateSync(day.data())) ||
    [];
  await putDaysInCache(daysDetails);
  return daysDetails;
}

async function getDayFromFirebaseOrCache(
  dayId: string,
  db = firebaseAdmin.firestore(),
) {
  const day = await getDayFromCache(dayId);
  if (day) return day;
  const dayDoc = await db.collection(Collections.DAYS).doc(dayId).get();
  return dayModalSchemaV2.nullable().validateSync(dayDoc.data());
}

export async function updateDayFirebaseAndCache(
  day: DayModalSchemaTypeV2,
  db = firebaseAdmin.firestore(),
  dataToUpdate: Partial<DayModalSchemaTypeV2> | DayModalSchemaTypeV2,
) {
  const newDay = { ...day, ...dataToUpdate };
  await putDayInCache(newDay);
  await db.collection(Collections.DAYS).doc(day.dayId).update(dataToUpdate);
}
