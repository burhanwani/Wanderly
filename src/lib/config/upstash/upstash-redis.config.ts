import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export enum RedisPrefix {
  RATE_LIMIT = "rate-limit:",
  PLACE = "place:",
  TRIP = "trip:",
  DAY = "day:",
  DISTANCE = "distance:",
  PLACE_TEXT = "placeFromText:",
  BUILDER = "builder:",
}

export const REDIS_CACHE_EXPIRY_CONFIGURATION = {
  TEN_MINUTES_IN_SECONDS: 600,
  ONE_HOUR_IN_SECONDS: 3600,
};

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
