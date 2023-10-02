import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { InferType, ValidationError, number, object, string } from "yup";
import { getBuilder } from "../../../../../lib/backend/services/builders.backend.services";
import {
  getTrip,
  updateNextDayOfTripV2,
} from "../../../../../lib/backend/services/trips.backend.services";
import { nextAuthOptions } from "../../../../../lib/config/auth/next-auth.config";
import {
  logDevDebug,
  logError,
} from "../../../../../lib/config/logger/logger.config";
import { openAi } from "../../../../../lib/config/open-ai/open-ai.config";
import { RESPONSE_CONSTANTS } from "../../../../../lib/constants/response.constants";
import { chatGptTripItineraryResponseSchemaV2 } from "../../../../../lib/schema/open-ai.v2.schema";

export type NextDayGenerationSchemaType = InferType<
  typeof nextDayGenerationSchema
>;

const nextDayGenerationSchema = object()
  .shape({
    tripId: string().required(),
    dayNumber: number().required(),
    dayId: string().required(),
  })
  .required();

export async function POST(req: NextRequest) {
  const session = await getServerSession(nextAuthOptions);
  const userId = session?.user?.id;
  if (!userId) {
    logError("Unauthenticated v1 day generation");
    return RESPONSE_CONSTANTS[401]();
  }
  console.time(`Create Next Day trip for ${userId}`);
  try {
    const json = await req.json();
    const data = await nextDayGenerationSchema.validate(json);
    const tripDetails = await getTrip(data?.tripId, userId);
    if (!tripDetails) {
      logError(`v2 day generation | Invalid Trip ${data?.tripId}`, userId);
      return RESPONSE_CONSTANTS[404]();
    }
    if (data.dayNumber > tripDetails?.tripDetails?.days?.length) {
      logError(
        `v2 day generation | Invalid Day Number ${data?.dayNumber} | Trip Id: ${data?.tripId}`,
        userId,
      );
      return RESPONSE_CONSTANTS[401]();
    }
    const builder = await getBuilder(data?.tripId);
    if (!builder) {
      logError(
        `v2 day generation | Builder not found | Trip Id: ${data?.tripId}`,
        userId,
      );
      return RESPONSE_CONSTANTS[404]();
    }
    const newMessage = builder?.messages?.map((message) => ({
      ...message,
    }));
    newMessage.push({
      content: `Please provide day ${data?.dayNumber} itinerary`,
      role: "user",
    });
    const res = await openAi.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: newMessage,
      temperature: 0.7,
      user: userId,
      stream: false,
    });
    const daysResponse = await res.json();
    logDevDebug("v2 Next day generation | ChatGpt Response", daysResponse);
    const days = daysResponse?.choices[0]?.message?.content;
    const parsedDays = JSON.parse(days);
    const validatedDays =
      chatGptTripItineraryResponseSchemaV2.validateSync(parsedDays);
    logDevDebug(
      `v2 Next day generation | day number : ${data?.dayNumber} | ChatGpt Parsed & Validated Response`,
      validatedDays,
    );
    if (daysResponse?.choices[0]?.message) builder.messages = newMessage;
    builder.messages.push(daysResponse?.choices[0]?.message);
    const dayDetailsWithPlaceDetails = await updateNextDayOfTripV2(
      validatedDays,
      tripDetails,
      data,
      builder,
    );
    console.timeEnd(`Create Next Day trip for ${userId}`);
    return RESPONSE_CONSTANTS[200](dayDetailsWithPlaceDetails);
  } catch (err) {
    if (err instanceof ValidationError) {
      logError(`v2 Next day generation | Invalid Payload`, userId, err);
      return RESPONSE_CONSTANTS[400](err.message);
    } else {
      logError(`v2 Next day generation | Unknown Error`, userId, err);
    }
  }
  return RESPONSE_CONSTANTS[500]();
}
