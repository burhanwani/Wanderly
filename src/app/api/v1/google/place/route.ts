import { getServerSession } from "next-auth";
import { nextAuthOptions } from "../../../../../lib/config/auth/next-auth.config";
import {
  getPlaceFromCache,
  putPlaceInCache,
} from "../../../../../lib/config/upstash/upstash-redis.config";
import { RESPONSE_CONSTANTS } from "../../../../../lib/constants/response.constants";
import { googlePlaceDetailResponseSchema } from "../../../../../lib/schema/place-details.schema";
import { getLocationDetailsByPlaceId } from "../../../../../lib/utils/google-places.utils";

export async function POST(request: Request) {
  const { placeId } = await request.json();
  const session = await getServerSession(nextAuthOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  try {
    const response = await getPlaceDetail(placeId);
    if (response && response?.status == "OK") {
      return RESPONSE_CONSTANTS[200](response);
    }
  } catch (err) {}
  return RESPONSE_CONSTANTS[400]("Invalid City Passed");
}

export async function getPlaceDetail(placeId: string) {
  const data = await getPlaceFromCache(placeId);
  if (data) return data;
  const response = await getLocationDetailsByPlaceId(placeId);
  if (response?.data?.status == "OK")
    await putPlaceInCache(placeId, response?.data);
  return googlePlaceDetailResponseSchema.validateSync(response?.data);
}
