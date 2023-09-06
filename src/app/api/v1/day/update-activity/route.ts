import { getServerSession } from "next-auth";
import { InferType } from "yup";
import { nextAuthOptions } from "../../../../../lib/config/auth/next-auth.config";
import firebaseAdmin from "../../../../../lib/config/firebase/firebase-admin.config";
import { Collections } from "../../../../../lib/constants/firebase.constants";
import { RESPONSE_CONSTANTS } from "../../../../../lib/constants/response.constants";
import { dayModalSchema } from "../../../../../lib/schema/day.schema";

export async function POST(request: Request) {
  const payload = await request.json();
  let validatedPayload = null;
  try {
    validatedPayload = dayModalSchema.validateSync(payload);
  } catch (err) {
    return RESPONSE_CONSTANTS[400];
  }
  const session = await getServerSession(nextAuthOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return RESPONSE_CONSTANTS[401];
  }
  return updateActivity(userId, validatedPayload);
}

async function updateActivity(
  userId: string,
  validatedPayload: InferType<typeof dayModalSchema>
) {
  const db = firebaseAdmin.firestore();
  const dayDoc = await db
    .collection(Collections.DAYS)
    .doc(validatedPayload.dayId)
    .get();
  if (dayDoc.exists) {
    const dayData = dayModalSchema.validateSync(dayDoc.data());
    if (dayData?.userId != userId) {
      return RESPONSE_CONSTANTS[401];
    }
    if (dayData?.tripId != validatedPayload.tripId) {
      return RESPONSE_CONSTANTS[401];
    }
    await dayDoc.ref.update(validatedPayload);
    return RESPONSE_CONSTANTS[200](validatedPayload);
  } else {
    return RESPONSE_CONSTANTS[400];
  }
}
