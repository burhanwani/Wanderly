import { getServerSession } from "next-auth";
import { getPlaceDetail } from "../../../../../lib/backend/services/places.backend.services";
import { nextAuthOptions } from "../../../../../lib/config/auth/next-auth.config";
import {
  logError,
  logInfo,
} from "../../../../../lib/config/logger/logger.config";
import { RESPONSE_CONSTANTS } from "../../../../../lib/constants/response.constants";

export async function POST(request: Request) {
  const session = await getServerSession(nextAuthOptions);
  const userId = session?.user?.id;
  if (!userId) {
    logError("Place Details | Unauthenticated Access", userId);
    return RESPONSE_CONSTANTS[401]();
  }
  try {
    const { placeId } = await request.json();
    const response = await getPlaceDetail(placeId);
    if (response && response?.status == "OK") {
      logInfo("Place Details | Successful", userId);
      return RESPONSE_CONSTANTS[200](response);
    }
  } catch (err) {}
  logError("Place Details | Invalid City Passed", userId);
  return RESPONSE_CONSTANTS[400]("Invalid City Passed");
}
