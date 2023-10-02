import { InferType, object, string } from "yup";

export type GenerateActivitiesRequestPayloadSchemaType = InferType<
  typeof generateActivitiesRequestPayloadSchema
>;

export const generateActivitiesRequestPayloadSchema = object()
  .shape({
    placeId: string().min(1).max(500).required("Place ID is required"),
  })
  .required();
