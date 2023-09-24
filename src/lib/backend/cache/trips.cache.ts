import { array } from "yup";
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
    console.log(`getTripFromCache by user Id ${userId} : `, data);
    return array().of(tripModalSchema).nullable().validateSync(data);
  }
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
  console.log(`putTripInCache by ${userId} :`, data);
};

export const getTripsLengthInCache = async (userId: string) => {
  const exists = await redisClient.exists(`${RedisPrefix.TRIP}${userId}`);
  if (exists) {
    return await redisClient.llen(`${RedisPrefix.TRIP}${userId}`);
  }
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
};
