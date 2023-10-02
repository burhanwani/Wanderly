import { InferType, array, number, object, string } from "yup";

export const distanceSchema = object()
  .shape({
    text: string().optional(),
    value: number().optional(),
  })
  .default({
    text: "-",
    value: 0,
  });

export const durationSchema = object()
  .shape({
    text: string().optional(),
    value: number().optional(),
  })
  .default({
    text: "-",
    value: 0,
  });

const elementSchema = object().shape({
  distance: distanceSchema,
  duration: durationSchema,
  status: string().optional().default("OK"),
});

const rowSchema = object().shape({
  elements: array().of(elementSchema).optional(),
});

export const distanceMatrixResponseSchema = object().shape({
  destination_addresses: array().of(string()).optional(),
  origin_addresses: array().of(string()).optional(),
  rows: array().of(rowSchema).optional(),
  status: string().optional(),
});

export type DistanceMatrixResponseSchemaType = InferType<
  typeof distanceMatrixResponseSchema
>;
