import { logCacheDebug } from "../../config/logger/logger.config";
import {
  REDIS_CACHE_EXPIRY_CONFIGURATION,
  RedisPrefix,
  redisClient,
} from "../../config/upstash/upstash-redis.config";
import {
  GooglePlaceDetailResponseType,
  googlePlaceDetailResponseSchema,
} from "../../schema/place-details.schema";

export const getPlaceFromCache = async (placeId: string) => {
  const data = await redisClient.get(`${RedisPrefix.PLACE}${placeId}`);
  try {
    logCacheDebug("Get Place", placeId, data);
    return googlePlaceDetailResponseSchema.validateSync(data);
  } catch (err) {
    return null;
  }
};

export const putPlaceInCache = async (place: GooglePlaceDetailResponseType) => {
  const placeId = place?.result?.place_id;
  if (placeId) {
    await redisClient.setex(
      `${RedisPrefix.PLACE}${placeId}`,
      REDIS_CACHE_EXPIRY_CONFIGURATION.ONE_HOUR_IN_SECONDS,
      place,
    );
    logCacheDebug("Put Place", placeId, place);
  }
};
