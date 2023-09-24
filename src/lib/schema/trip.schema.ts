import { InferType, array, object, string } from "yup";
import { WanderlyVersion } from "../config/app/app.config";
import { locationSchema } from "./day.schema";

export const tripModalSchema = object()
  .shape({
    placeId: string().min(1).max(500).required("Place ID is required"),
    days: array()
      .of(string().required())
      .min(0)
      .max(14)
      .required("Days should be number between 1 and 14"),
    userId: string().required(),
    tripId: string().required(),
    placeName: string().required(),
    location: locationSchema,
    // photoReference: string().optional(),
    version: string().oneOf(Object.values(WanderlyVersion)).required(),
  })
  .required();

export type TripModalSchemaType = InferType<typeof tripModalSchema>;

export const tripIdParamSchema = string().required();
