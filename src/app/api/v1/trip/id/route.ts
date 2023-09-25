import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { ValidationError } from "yup";
import { nextAuthOptions } from "../../../../../lib/config/auth/next-auth.config";
import { RESPONSE_CONSTANTS } from "../../../../../lib/constants/response.constants";
import { tripIdParamSchema } from "../../../../../lib/schema/trip.schema";

import { getTrip } from "../../../../../lib/backend/services/trips.backend.services";

export async function POST(req: NextRequest) {
  const session = await getServerSession(nextAuthOptions);
  const userId = session?.user?.id;
  if (!userId) return RESPONSE_CONSTANTS[401]();
  const { tripId = null } = await req.json();
  try {
    const data = await tripIdParamSchema.validate(tripId);
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
  return RESPONSE_CONSTANTS[500]();
}
