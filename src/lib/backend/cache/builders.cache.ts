import {
  REDIS_CACHE_EXPIRY_CONFIGURATION,
  RedisPrefix,
  redisClient,
} from "../../config/upstash/upstash-redis.config";
import {
  ChatGptTripBuilderModalSchemaType,
  chatGptTripBuilderModalSchema,
} from "../../schema/chat-gpt-trip-builder.schema";

export const getBuilderFromCache = async (tripId: string) => {
  const data = await redisClient.get(`${RedisPrefix.BUILDER}${tripId}`);
  console.log(`getBuilderFromCache ${tripId}`, data);
  try {
    return chatGptTripBuilderModalSchema.validateSync(data);
  } catch (err) {
    return null;
  }
};

export const putBuilderInCache = async (
  builder: ChatGptTripBuilderModalSchemaType
) => {
  if (builder.tripId) {
    await redisClient.setex(
      `${RedisPrefix.BUILDER}${builder.tripId}`,
      REDIS_CACHE_EXPIRY_CONFIGURATION.ONE_HOUR_IN_SECONDS,
      builder
    );
    console.log(`putPlaceInCache ${builder.tripId}`, builder);
  }
};
