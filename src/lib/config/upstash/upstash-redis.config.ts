import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { array } from "yup";
import {
  GooglePlaceDetailResponseType,
  googlePlaceDetailResponseSchema,
} from "../../schema/place-details.schema";
import { TripModalSchemaType, tripModalSchema } from "../../schema/trip.schema";

enum RedisPrefix {
  RATE_LIMIT = "rate-limit:",
  PLACE = "place:",
  TRIP = "trip:",
}

const TEN_MINUTES_IN_SECONDS = 600;

export const rateLimit = {
  googlePrediction: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(50, "20s"),
    timeout: 1000,
    analytics: true,
    prefix: RedisPrefix.RATE_LIMIT,
  }),
};

export const redisClient = Redis.fromEnv();

export const getPlaceFromCache = async (placeId: string) => {
  const data = await redisClient.get(`${RedisPrefix.PLACE}${placeId}`);
  console.log(`getPlaceFromCache ${placeId}`, data);
  try {
    return googlePlaceDetailResponseSchema.validateSync(data);
  } catch (err) {
    return null;
  }
};

export const putPlaceInCache = async (
  placeId: string,
  data: GooglePlaceDetailResponseType
) => {
  await redisClient.setex(
    `${RedisPrefix.PLACE}${placeId}`,
    TEN_MINUTES_IN_SECONDS,
    data
  );
  console.log(`putPlaceInCache ${placeId}`, data);
};

export const getTripsFromCache = async (userId: string) => {
  const data = await redisClient.get(`${RedisPrefix.TRIP}${userId}`);
  console.log(`getTripFromCache by user Id ${userId} : `, data);
  return array().of(tripModalSchema).nullable().validateSync(data);
};

export const putTripsInCache = async (
  userId: string,
  data: TripModalSchemaType[]
) => {
  await redisClient.setex(
    `${RedisPrefix.TRIP}${userId}`,
    TEN_MINUTES_IN_SECONDS,
    data
  );
  console.log(`putTripInCache by ${userId} :`, data);
};
