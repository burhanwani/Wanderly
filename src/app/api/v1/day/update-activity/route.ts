import { getServerSession } from "next-auth";
import { updateDayActivity } from "../../../../../lib/backend/services/days.backend.services";
import { nextAuthOptions } from "../../../../../lib/config/auth/next-auth.config";
import { logError } from "../../../../../lib/config/logger/logger.config";
import { RESPONSE_CONSTANTS } from "../../../../../lib/constants/response.constants";
import { dayModalSchemaV2 } from "../../../../../lib/schema/day.v2.schema";

export async function POST(request: Request) {
  const session = await getServerSession(nextAuthOptions);
  const userId = session?.user?.id;
  if (!userId) {
    logError("Update Activity | Unauthenticated Access", userId);
    return RESPONSE_CONSTANTS[401]();
  }

  let validatedPayload = null;
  try {
    const payload = await request.json();
    validatedPayload = dayModalSchemaV2.validateSync(payload);
  } catch (err) {
    logError("Update Activity | Invalid Payload", userId, err);
    return RESPONSE_CONSTANTS[400]();
  }

  return updateDayActivity(userId, validatedPayload);
}
