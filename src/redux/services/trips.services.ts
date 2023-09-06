import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../lib/config/axios/basequery.endpoint.config";
import { API_ROUTES_CONSTANTS } from "../../lib/constants/routes.constants";

import { TripBasicDetailsDialogForm } from "../../lib/schema/city-builder-form.schema";
import { DayModalSchemaType } from "../../lib/schema/day.schema";
import { GooglePlaceDetailResponseType } from "../../lib/schema/place-details.schema";
import { TripModalSchemaType } from "../../lib/schema/trip.schema";
import daysSlice from "../features/days.slice";
import googleSlice from "../features/google.slice";
import tripsSlice from "../features/trips.slice";

// Define a service using a base URL and expected endpoints
const tripApi = createApi({
  reducerPath: "tripApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Trip"],
  endpoints: (builder) => ({
    getTrips: builder.query<TripModalSchemaType[], void>({
      query: () => ({
        url: API_ROUTES_CONSTANTS.myTrips,
        method: "get",
      }),
      async onQueryStarted(_queryParam, { dispatch, queryFulfilled }) {
        try {
          const data = await queryFulfilled;
          if (data?.data) {
            dispatch(tripsSlice.actions.upsertMany(data?.data || []));
          }
        } catch (err) {}
      },
      providesTags: (result) =>
        // is result available?
        result // successful query
          ? [
              ...((result || [])?.map(
                ({ tripId }) => ({ type: "Trip", id: tripId }) as const
              ) || []),
              { type: "Trip", id: "LIST" },
            ] // an error occurred, but we still want to refetch this query when `{ type: 'Trip', id: 'LIST' }` is invalidated
          : [{ type: "Trip", id: "LIST" }],
    }),
    createTrip: builder.mutation<
      {
        tripDetails: TripModalSchemaType;
        dayDetails: DayModalSchemaType[];
        places: GooglePlaceDetailResponseType[];
      },
      TripBasicDetailsDialogForm
    >({
      query: (data) => ({
        url: API_ROUTES_CONSTANTS.createTrip,
        method: "POST",
        data,
      }),
      async onQueryStarted(_queryParam, { dispatch, queryFulfilled }) {
        try {
          const data = await queryFulfilled;
          if (data?.data) {
            dispatch(
              tripsSlice.actions.upsertOne(data?.data?.tripDetails || [])
            );
            dispatch(
              daysSlice.actions.upsertMany(data?.data?.dayDetails || [])
            );
            dispatch(
              googleSlice.actions.upsertManyPlaces(data?.data?.places || [])
            );
          }
        } catch (err) {}
      },
    }),
    getTrip: builder.query<
      {
        tripDetails: TripModalSchemaType;
        daysDetails: DayModalSchemaType[];
        places: GooglePlaceDetailResponseType[];
      },
      string
    >({
      query: (tripId: string) => ({
        url: API_ROUTES_CONSTANTS.getTripById,
        method: "POST",
        data: {
          tripId,
        },
      }),
      async onQueryStarted(_queryParam, { dispatch, queryFulfilled }) {
        try {
          const data = await queryFulfilled;
          if (data?.data) {
            dispatch(
              tripsSlice.actions.upsertOne(data?.data?.tripDetails || [])
            );
            dispatch(
              daysSlice.actions.upsertMany(data?.data?.daysDetails || [])
            );
            dispatch(
              googleSlice.actions.upsertManyPlaces(data?.data?.places || [])
            );
          }
        } catch (err) {}
      },
    }),
  }),
});
// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useLazyGetTripsQuery,
  useCreateTripMutation,
  useLazyGetTripQuery,
  useGetTripQuery,
} = tripApi;

export default tripApi;
