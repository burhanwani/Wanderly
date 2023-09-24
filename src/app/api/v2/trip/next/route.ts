import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { InferType, ValidationError, number, object, string } from "yup";
import { getBuilder } from "../../../../../lib/backend/services/builders.backend.services";
import {
  getTrip,
  updateNextDayOfTripV2,
} from "../../../../../lib/backend/services/trips.backend.services";
import { nextAuthOptions } from "../../../../../lib/config/auth/next-auth.config";
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
  })
  .required();

export async function POST(req: NextRequest) {
  const session = await getServerSession(nextAuthOptions);
  const userId = session?.user?.id;
  if (!userId) return RESPONSE_CONSTANTS[401];
  const json = await req.json();
  try {
    const data = await nextDayGenerationSchema.validate(json);
    const tripDetails = await getTrip(data?.tripId, userId);
    if (!tripDetails) {
      return RESPONSE_CONSTANTS[404];
    }
    if (data.dayNumber > tripDetails?.tripDetails?.days?.length) {
      return RESPONSE_CONSTANTS[401];
    }
    const builder = await getBuilder(data?.tripId);
    if (!builder) {
      return RESPONSE_CONSTANTS[404];
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
    console.log("next daysResponse", daysResponse);
    const days = daysResponse?.choices[0]?.message?.content;
    const parsedDays = JSON.parse(days);
    console.log("next parsedDays", parsedDays);
    const validatedDays =
      chatGptTripItineraryResponseSchemaV2.validateSync(parsedDays);
    console.log("next validatedDays", validatedDays);
    if (daysResponse?.choices[0]?.message) builder.messages = newMessage;
    builder.messages.push(daysResponse?.choices[0]?.message);
    const dayDetailsWithPlaceDetails = await updateNextDayOfTripV2(
      validatedDays,
      tripDetails,
      data,
      builder
    );
    return RESPONSE_CONSTANTS[200](dayDetailsWithPlaceDetails);
  } catch (err) {
    console.log("error", err);
    if (err instanceof ValidationError)
      return RESPONSE_CONSTANTS[400](err.message);
  }
  return RESPONSE_CONSTANTS[500];
}
