import { InferType, array, number, object, string } from "yup";

const locationSchema = object().shape({
  lat: number().required(),
  lng: number().required(),
});

const viewportSchema = object().shape({
  northeast: locationSchema,
  southwest: locationSchema,
});

const geometrySchema = object().shape({
  location: locationSchema,
  viewport: viewportSchema,
});

const candidateSchema = object().shape({
  // formatted_address: string().optional(),
  // geometry: geometrySchema,
  // name: string().required(),
  // opening_hours: object({
  //   open_now: boolean().optional(),
  // }),
  // rating: number().optional(),
  place_id: string().required(),
});

export const googlePlaceFromTextSchema = object().shape({
  candidates: array().of(candidateSchema).required(),
  status: string().required(),
});

export type GooglePlaceFromTextSchemaType = InferType<
  typeof googlePlaceFromTextSchema
>;
