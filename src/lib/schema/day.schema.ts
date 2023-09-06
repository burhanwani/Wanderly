import { InferType, array, number, object, string } from "yup";
import { distanceSchema, durationSchema } from "./distance-matrix-api.schema";

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

export const activityModalSchema = object()
  .shape({
    time: string().oneOf(Object.values(TimeOfTheDay)).required(),
    name: string().required(),
    description: string().required(),
    allocatedTime: number().required(),
    placeId: string().required(),
    travel: object().shape({
      distance: distanceSchema,
      duration: durationSchema,
    }),
    // photoReference: string().optional(),
    location: locationSchema,
  })
  .required();
export type ActivityModalSchemaType = InferType<typeof activityModalSchema>;

export const startTimeSchema = string()
  .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
  .default("09:00");

export const dayIdSchema = string().required();

export const dayModalSchema = object().shape({
  tripId: string().required(),
  userId: string().required(),
  activities: array().of(activityModalSchema).required(),
  dayId: dayIdSchema,
  startTime: startTimeSchema,
});

export type DayModalSchemaType = InferType<typeof dayModalSchema>;
