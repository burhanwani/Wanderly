import * as yup from "yup";
import { InferType } from "yup";

const AddressComponentSchema = yup.object().shape({
  long_name: yup.string().default(""),
  short_name: yup.string().default(""),
  types: yup.array().of(yup.string()).default([]),
});

const GeometryLocationSchema = yup.object().shape({
  lat: yup.number().default(0),
  lng: yup.number().default(0),
});

export type GeometryLocationSchemaType = InferType<
  typeof GeometryLocationSchema
>;

const GeometryViewportSchema = yup.object().shape({
  northeast: GeometryLocationSchema.default({
    lat: 0,
    lng: 0,
  }),
  southwest: GeometryLocationSchema.default({
    lat: 0,
    lng: 0,
  }),
});

const GeometrySchema = yup.object().shape({
  location: GeometryLocationSchema.default({
    lat: 0,
    lng: 0,
  }),
  viewport: GeometryViewportSchema.nullable().default(null),
});

const OpeningHoursSchema = yup.object().shape({
  open_now: yup.boolean().default(false),
  periods: yup
    .array()
    .of(
      yup.object().shape({
        close: yup
          .object()
          .shape({
            day: yup.number().default(0),
            time: yup.string().default("0000"),
          })
          .default({
            day: 0,
            time: "0000",
          }),
        open: yup
          .object()
          .shape({
            day: yup.number().default(0),
            time: yup.string().default("0000"),
          })
          .default({
            day: 0,
            time: "0000",
          }),
      })
    )
    .default([]),
  weekday_text: yup.array().of(yup.string().default("")).default([]),
});

const PhotoSchema = yup.object().shape({
  height: yup.number().default(0),
  html_attributions: yup.array().of(yup.string().default("")).default([]),
  photo_reference: yup.string().default(""),
  width: yup.number().default(0),
});

const PlusCodeSchema = yup.object().shape({
  compound_code: yup.string().nullable().default(null),
  global_code: yup.string().default(""),
});

const ReviewSchema = yup.object().shape({
  author_name: yup.string().default(""),
  author_url: yup.string().nullable().default(null),
  language: yup.string().nullable().default(null),
  profile_photo_url: yup.string().nullable().default(null),
  rating: yup.number().nullable().default(null),
  relative_time_description: yup.string().nullable().default(null),
  text: yup.string().default(""),
  time: yup.number().nullable().default(null),
});
const ResultSchema = yup.object().shape({
  address_components: yup.array().of(AddressComponentSchema).default([]),
  adr_address: yup.string().nullable().default(null),
  business_status: yup.string().nullable().default(null),
  formatted_address: yup.string().nullable().default(null),
  formatted_phone_number: yup.string().nullable().default(null),
  geometry: GeometrySchema,
  icon: yup.string().nullable().default(null),
  international_phone_number: yup.string().nullable().default(null),
  name: yup.string().default(""),
  opening_hours: OpeningHoursSchema.nullable().default(null),
  photos: yup.array().of(PhotoSchema).default([]),
  place_id: yup.string().default(""),
  plus_code: PlusCodeSchema.nullable().default(null),
  price_level: yup.number().nullable().default(null),
  rating: yup.number().nullable().default(null),
  reference: yup.string().nullable().default(null),
  reviews: yup.array().of(ReviewSchema).default([]),
  types: yup.array().of(yup.string().default("")).default([]),
  url: yup.string().nullable().default(null),
  user_ratings_total: yup.number().nullable().default(null),
  utc_offset: yup.number().nullable().default(null),
  vicinity: yup.string().nullable().default(null),
  website: yup.string().nullable().default(null),
});
export const googlePlaceDetailResponseSchema = yup.object().shape({
  html_attributions: yup.array().of(yup.string().default("")).default([]),
  result: ResultSchema,
  status: yup.string().default("OK"),
});
export type GooglePlaceDetailResponseType = InferType<
  typeof googlePlaceDetailResponseSchema
>;
