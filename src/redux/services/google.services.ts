import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../lib/config/axios/basequery.endpoint.config";
import { API_ROUTES_CONSTANTS } from "../../lib/constants/routes.constants";
import { GooglePlaceDetailResponseType } from "../../lib/schema/place-details.schema";
import { GooglePlacesAutocompleteResponseSchemaType } from "../../lib/schema/prediction.schema";
import googleSlice from "../features/google.slice";

// Define a service using a base URL and expected endpoints
const googleApi = createApi({
  reducerPath: "googleApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Places", "Predictions"],
  endpoints: (builder) => ({
    getPredictions: builder.query<
      GooglePlacesAutocompleteResponseSchemaType["predictions"],
      string
    >({
      query: (search = "") => ({
        url: API_ROUTES_CONSTANTS.predictions,
        method: "post",
        data: {
          search,
        },
      }),
      async onQueryStarted(_queryParam, { dispatch, queryFulfilled }) {
        try {
          const data = await queryFulfilled;

          dispatch(googleSlice.actions.upsertManyPrediction(data?.data || []));
        } catch (err) {}
      },
      providesTags: (result) =>
        // is result available?
        result // successful query
          ? [
              ...(result || []).map(
                ({ place_id }) =>
                  ({ type: "Predictions", id: place_id }) as const,
              ),
              { type: "Predictions", id: "LIST" },
            ] // an error occurred, but we still want to refetch this query when `{ type: 'Trip', id: 'LIST' }` is invalidated
          : [{ type: "Predictions", id: "LIST" }],
    }),
    getPlaceDetail: builder.query<GooglePlaceDetailResponseType, string>({
      query: (placeId = "") => ({
        url: API_ROUTES_CONSTANTS.place,
        method: "post",
        data: {
          placeId,
        },
      }),
      async onQueryStarted(_queryParam, { dispatch, queryFulfilled }) {
        try {
          const data = await queryFulfilled;
          if (data?.data)
            dispatch(googleSlice.actions.upsertManyPlaces([data?.data]));
        } catch (err) {}
      },
      providesTags: (result) =>
        // is result available?
        result // successful query
          ? [
              { type: "Places", id: result?.result?.place_id } as const,
              { type: "Places", id: "LIST" },
            ] // an error occurred, but we still want to refetch this query when `{ type: 'Trip', id: 'LIST' }` is invalidated
          : [{ type: "Places", id: "LIST" }],
    }),
  }),
});
// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useLazyGetPredictionsQuery, useLazyGetPlaceDetailQuery } =
  googleApi;

export default googleApi;
