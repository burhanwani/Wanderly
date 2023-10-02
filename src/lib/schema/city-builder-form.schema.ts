import { InferType, array, mixed, number, object, string } from "yup";

import { ActivityTypes, TripWith } from "../constants/firebase.constants";

export type TripBasicDetailsDialogForm = InferType<
  typeof cityBuilderModalSchema
>;

export const cityBuilderModalSchema = object()
  .shape({
    placeId: string().min(1).max(500).required("Place ID is required"),
    days: number()
      .typeError("Days must be a number between 1 and 7")
      .min(1)
      .max(7)
      .default(1)
      .required("Days should be number between 1 and 7"),
    additionalInformation: string().max(500).min(0).optional(),
    tripWith: mixed<TripWith>()
      .test("tripWith", (value) => {
        return Object.values(TripWith).includes(value as TripWith);
      })
      .required("Who’s coming with you is required"),
    activityTypes: array(
      mixed<ActivityTypes>().oneOf(Object.values(ActivityTypes)).required(),
    )
      .ensure()
      .required("Invalid Activity Types passed"),
  })
  .required();
