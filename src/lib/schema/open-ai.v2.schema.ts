import { InferType, array, lazy, number, object, string } from "yup";

export const chatGptTripGeneratorSchemaV2 = object()
  .shape({
    name: string().required(),
    time_of_day: string().oneOf(["morning", "noon", "evening"]).required(),
    google_place_name: string().required(),
    booking: string()
      .oneOf(["Required", "Not required", "Recommended"])
      .optional(),
    budget: string().optional(),
    duration_seconds: number().positive().integer().required(),
    description: string().required(),
    popularity: string().optional(),
    reasoning: string().optional(),
    tips: string().optional(),
    placeId: string().optional(), // Doesn't return placeId
  })
  .required();

export const chatGptTripGeneratorMultipleSchemaV2 = array(
  chatGptTripGeneratorSchemaV2
)
  .min(0)
  .default([])
  .required();

export type ChatGptTripGeneratorMultipleSchemaV2Type = InferType<
  typeof chatGptTripGeneratorMultipleSchemaV2
>;

export type ChatGptTripDayItineraryTypeV2 = InferType<
  typeof chatGptTripGeneratorSchemaV2
>;
export const chatGptTripItineraryResponseSchemaV2 = lazy(
  (obj: { [key: string | number]: ChatGptTripDayItineraryTypeV2[] }) =>
    object(
      Object.keys(obj)
        .sort()
        .reduce(
          (
            shape: {
              [
                key: string | number
              ]: typeof chatGptTripGeneratorMultipleSchemaV2;
            },
            key
          ) => {
            shape[key] = chatGptTripGeneratorMultipleSchemaV2;
            return shape;
          },
          {}
        )
    )
);

export type ChatGptTripItineraryResponseTypeV2 = InferType<
  typeof chatGptTripItineraryResponseSchemaV2
>;
