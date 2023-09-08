import { InferType, mixed, object, string } from "yup";

export const chatGptTripBuilderModalSchema = object().shape({
  tripId: string().required(),
  userId: string().required(),
  messages: mixed().required(),
  response: mixed().required(),
});

export type ChatGptTripBuilderModalSchemaType = InferType<
  typeof chatGptTripBuilderModalSchema
>;
