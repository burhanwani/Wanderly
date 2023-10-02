import { ChatCompletionRequestMessage } from "openai-edge";
import { InferType, mixed, object, string } from "yup";

export const chatGptTripBuilderModalSchema = object().shape({
  tripId: string().required(),
  userId: string().required(),
  messages: mixed<ChatCompletionRequestMessage[]>().default([]).required(),
});

export type ChatGptTripBuilderModalSchemaType = InferType<
  typeof chatGptTripBuilderModalSchema
> & {
  messages: ChatCompletionRequestMessage[];
};
