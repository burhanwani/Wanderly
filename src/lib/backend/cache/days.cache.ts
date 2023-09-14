import {
  REDIS_CACHE_EXPIRY_CONFIGURATION,
  RedisPrefix,
  redisClient,
} from "../../config/upstash/upstash-redis.config";
import { DayModalSchemaType, dayModalSchema } from "../../schema/day.schema";

export const getDayFromCache = async (dayId: string) => {
  const data = await redisClient.get(`${RedisPrefix.DAY}${dayId}`);
  console.log(`getDayFromCache by day Id ${dayId} : `, data);
  return dayModalSchema.nullable().validateSync(data);
};

export const putDayInCache = async (data: DayModalSchemaType) => {
  await redisClient.setex(
    `${RedisPrefix.DAY}${data.dayId}`,
    REDIS_CACHE_EXPIRY_CONFIGURATION.TEN_MINUTES_IN_SECONDS,
    data
  );
  console.log(`putDayInCache by ${data.dayId} :`, data);
};

export const putDaysInCache = async (days: DayModalSchemaType[] = []) => {
  const promises = days.map((day) => putDayInCache(day));
  return await Promise.all(promises);
};
