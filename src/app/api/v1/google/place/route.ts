import { getServerSession } from "next-auth";
import { getPlaceDetail } from "../../../../../lib/backend/services/places.backend.services";
import { nextAuthOptions } from "../../../../../lib/config/auth/next-auth.config";
import { RESPONSE_CONSTANTS } from "../../../../../lib/constants/response.constants";

export async function POST(request: Request) {
  const { placeId } = await request.json();
  const session = await getServerSession(nextAuthOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return RESPONSE_CONSTANTS[401]();
  }
  try {
    const response = await getPlaceDetail(placeId);
    if (response && response?.status == "OK") {
      return RESPONSE_CONSTANTS[200](response);
    }
  } catch (err) {}
  return RESPONSE_CONSTANTS[400]("Invalid City Passed");
}
