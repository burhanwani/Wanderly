import { logCacheDebug } from "../../config/logger/logger.config";
import {
  REDIS_CACHE_EXPIRY_CONFIGURATION,
  RedisPrefix,
  redisClient,
} from "../../config/upstash/upstash-redis.config";
import {
  DayModalSchemaTypeV2,
  dayModalSchemaV2,
} from "../../schema/day.v2.schema";

export const getDayFromCache = async (dayId: string) => {
  const data = await redisClient.get(`${RedisPrefix.DAY}${dayId}`);
  logCacheDebug("Get Day", dayId, data);
  return dayModalSchemaV2.nullable().validateSync(data);
};

export const putDayInCache = async (data: DayModalSchemaTypeV2) => {
  await redisClient.setex(
    `${RedisPrefix.DAY}${data.dayId}`,
    REDIS_CACHE_EXPIRY_CONFIGURATION.ONE_HOUR_IN_SECONDS,
    data,
  );
  logCacheDebug("Put Day", data?.dayId, data);
};

export const putDaysInCache = async (days: DayModalSchemaTypeV2[] = []) => {
  const promises = days.map((day) => putDayInCache(day));
  return await Promise.all(promises);
};
