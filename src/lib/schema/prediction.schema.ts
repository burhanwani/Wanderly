import { InferType, array, number, object, string } from "yup";

const StructuredFormattingSchema = object().shape({
  main_text: string().default(""),
  main_text_matched_substrings: array()
    .of(
      object().shape({
        length: number().default(0),
        offset: number().default(0),
      }),
    )
    .default([]),
  secondary_text: string().default(""),
});

const TermSchema = object().shape({
  offset: number().default(0),
  value: string().default(""),
});

const PredictionSchema = object().shape({
  description: string().default(""),
  // distance_meters: number().nullable().default(null),
  id: string().default(""),
  matched_substrings: array()
    .of(
      object().shape({
        length: number().default(0),
        offset: number().default(0),
      }),
    )
    .default([]),
  place_id: string().default(""),
  reference: string().default(""),
  structured_formatting: StructuredFormattingSchema,
  terms: array().of(TermSchema).default([]),
  types: array().of(string().default("")).default([]),
});

const googlePlacesAutocompleteResponseSchema = object().shape({
  predictions: array().of(PredictionSchema).default([]),
  status: string().default("OK"),
});

export type GooglePlacesAutocompleteResponseSchemaType = InferType<
  typeof googlePlacesAutocompleteResponseSchema
>;
