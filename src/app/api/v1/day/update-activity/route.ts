import { getServerSession } from "next-auth";
import { updateDayActivity } from "../../../../../lib/backend/services/days.backend.services";
import { nextAuthOptions } from "../../../../../lib/config/auth/next-auth.config";
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
  return updateDayActivity(userId, validatedPayload);
}
