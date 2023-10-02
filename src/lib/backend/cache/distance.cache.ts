import { logCacheDebug } from "../../config/logger/logger.config";
import {
  REDIS_CACHE_EXPIRY_CONFIGURATION,
  RedisPrefix,
  redisClient,
} from "../../config/upstash/upstash-redis.config";
import {
  DistanceMatrixResponseSchemaType,
  distanceMatrixResponseSchema,
} from "../../schema/distance-matrix-api.schema";
import { GooglePlaceDetailResponseType } from "../../schema/place-details.schema";

/**
 *
 * @param key = origin_lat,origin_long:destination_lat,destination_long
 *
 */

export const getDistanceFromCache = async (key: string) => {
  const data = await redisClient.get(`${RedisPrefix.DISTANCE}${key}`);
  try {
    logCacheDebug("Get Google Distance", key, data);
    return distanceMatrixResponseSchema.validateSync(data);
  } catch (err) {
    return null;
  }
};

export const putDistanceInCache = async (
  key: string,
  response: DistanceMatrixResponseSchemaType,
) => {
  if (key) {
    await redisClient.setex(
      `${RedisPrefix.DISTANCE}${key}`,
      REDIS_CACHE_EXPIRY_CONFIGURATION.ONE_HOUR_IN_SECONDS,
      response,
    );
    logCacheDebug("Put Google Distance", key, response);
  }
};

export const buildDistanceCacheKey = (
  place: GooglePlaceDetailResponseType,
  nextPlace: GooglePlaceDetailResponseType,
) => {
  return `${place?.result?.geometry?.location?.lat},${place?.result?.geometry?.location?.lng}:${nextPlace?.result?.geometry?.location?.lat},${nextPlace?.result?.geometry?.location?.lng}`;
};
