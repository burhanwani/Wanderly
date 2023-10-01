import firebaseAdmin from "../../config/firebase/firebase-admin.config";
import { Collections } from "../../constants/firebase.constants";
import {
  ChatGptTripBuilderModalSchemaType,
  chatGptTripBuilderModalSchema,
} from "../../schema/chat-gpt-trip-builder.schema";
import {
  getBuilderFromCache,
  putBuilderInCache,
} from "../cache/builders.cache";

export async function getBuilder(tripId: string) {
  const builderFromCache = await getBuilderFromCache(tripId);
  if (builderFromCache) return builderFromCache;
  const db = firebaseAdmin.firestore();
  const builderDoc = await db
    .collection(Collections.BUILDERS)
    .doc(tripId)
    .get();
  if (!builderDoc.exists) {
    return null;
  }
  const builder = chatGptTripBuilderModalSchema
    .required()
    .validateSync(builderDoc.data());
  await putBuilderInCache(builder);
  return builder;
}

export async function createBuilder(
  messageDetails: ChatGptTripBuilderModalSchemaType
) {
  const db = firebaseAdmin.firestore();
  db.collection(Collections.BUILDERS)
    .doc(messageDetails?.tripId)
    .create(messageDetails);
  await putBuilderInCache(messageDetails);
  return messageDetails;
}

export async function updateBuilder(
  messageDetails: ChatGptTripBuilderModalSchemaType
) {
  const db = firebaseAdmin.firestore();
  db.collection(Collections.BUILDERS)
    .doc(messageDetails.tripId)
    .update(messageDetails);
  await putBuilderInCache(messageDetails);
  return messageDetails;
}
