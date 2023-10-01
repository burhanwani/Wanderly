import { array } from "yup";
import { logCacheDebug } from "../../config/logger/logger.config";
import {
  REDIS_CACHE_EXPIRY_CONFIGURATION,
  RedisPrefix,
  redisClient,
} from "../../config/upstash/upstash-redis.config";
import { TripModalSchemaType, tripModalSchema } from "../../schema/trip.schema";

export const getTripsFromCache = async (userId: string) => {
  const exists = await redisClient.exists(`${RedisPrefix.TRIP}${userId}`);
  if (exists) {
    const data = await redisClient.lrange(
      `${RedisPrefix.TRIP}${userId}`,
      0,
      -1
    );
    logCacheDebug("Get Trips", userId, data);
    return array().of(tripModalSchema).nullable().validateSync(data);
  }
  logCacheDebug("Get Trips", userId, null);
  return null;
};

export const putTripsInCache = async (
  userId: string,
  data: TripModalSchemaType[] = []
) => {
  if (data.length <= 0) return;
  await redisClient.lpush(`${RedisPrefix.TRIP}${userId}`, ...data);
  await redisClient.expire(
    `${RedisPrefix.TRIP}${userId}`,
    REDIS_CACHE_EXPIRY_CONFIGURATION.ONE_HOUR_IN_SECONDS
  );
  logCacheDebug("Put Trips", userId, data);
};

export const getTripsLengthInCache = async (userId: string) => {
  const exists = await redisClient.exists(`${RedisPrefix.TRIP}${userId}`);
  logCacheDebug("Exists Trips", userId, exists);
  if (exists) {
    const length = await redisClient.llen(`${RedisPrefix.TRIP}${userId}`);
    logCacheDebug("Check Length Trips", userId, length);
    return length;
  }
  logCacheDebug("Check Length Trips", userId, null);
  return null;
};

export const deleteTripInCache = async (userId: string, tripId: string) => {
  const luaScript = `
local items = redis.call('LRANGE', KEYS[1], 0, -1)
for i, item in ipairs(items) do
    local data = cjson.decode(item)
    if data.tripId == ARGV[1] then
        redis.call('LREM', KEYS[1], 1, item)
        return cjson.encode(data)
    end
end
return nil
`;
  await redisClient.eval(luaScript, [`${RedisPrefix.TRIP}${userId}`], [tripId]);
  logCacheDebug("Remove Length Trips", userId, null);
};
