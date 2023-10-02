import { InferType, array, lazy, number, object, string } from "yup";

export const chatGptTripGeneratorSchema = object()
  .shape({
    time: string().required(),
    google_place_name: string().required(),
    description: string().required(),
    allocated_time: number().required(),
  })
  .required();

export const chatGptTripGeneratorMultipleSchema = array(
  chatGptTripGeneratorSchema,
).required();

export type ChatGptTripDayItineraryType = InferType<
  typeof chatGptTripGeneratorSchema
>;
export const chatGptTripItineraryResponseSchema = lazy(
  (obj: { [key: string | number]: ChatGptTripDayItineraryType[] }) =>
    object(
      Object.keys(obj).reduce(
        (
          shape: {
            [key: string | number]: typeof chatGptTripGeneratorMultipleSchema;
          },
          key,
        ) => {
          shape[key] = array(chatGptTripGeneratorSchema).required();
          return shape;
        },
        {},
      ),
    ),
);

export type ChatGptTripItineraryResponseType = InferType<
  typeof chatGptTripItineraryResponseSchema
>;
