import { InferType, array, boolean, number, object, string } from "yup";
import { distanceMatrixResponseSchema } from "./distance-matrix-api.schema";
import {
  ChatGptTripDayItineraryTypeV2,
  chatGptTripGeneratorSchemaV2,
} from "./open-ai.v2.schema";
import { googlePlaceDetailResponseSchema } from "./place-details.schema";

export enum TimeOfTheDay {
  Morning = "Morning",
  Afternoon = "Afternoon",
  Evening = "Evening",
}

export const locationSchema = object().shape({
  lat: number()
    .required("Latitude is required")
    .min(-90, "Latitude should be between -90 and 90")
    .max(90, "Latitude should be between -90 and 90"),
  lng: number()
    .required("Longitude is required")
    .min(-180, "Longitude should be between -180 and 180")
    .max(180, "Longitude should be between -180 and 180"),
});

export const activityModalSchemaV2 = object()
  .shape({
    ...chatGptTripGeneratorSchemaV2.fields,
    placeId: string().optional(),
    // travel: object().shape({
    //   distance: distanceSchema,
    //   duration: durationSchema,
    // }),
    // // photoReference: string().optional(),
    // location: locationSchema,
    place_details: googlePlaceDetailResponseSchema.nullable().optional(),
    duration_details: distanceMatrixResponseSchema.nullable().optional(),
    // place_url: string().optional(),
  })
  .required();
export type ActivityModalSchemaTypeV2 =
  | InferType<typeof activityModalSchemaV2>
  | ChatGptTripDayItineraryTypeV2;

export const startTimeSchema = string()
  .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
  .default("09:00");

export const dayIdSchema = string().required();

export const dayModalSchemaV2 = object().shape({
  tripId: string().required(),
  userId: string().required(),
  activities: array().of(activityModalSchemaV2).default([]).min(0).required(),
  dayId: dayIdSchema,
  startTime: startTimeSchema,
  isDayGenerated: boolean().default(false).required(),
});

export type DayModalSchemaTypeV2 = InferType<typeof dayModalSchemaV2> & {
  activities: ActivityModalSchemaTypeV2[];
};
