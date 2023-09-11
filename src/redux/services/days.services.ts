import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../lib/config/axios/basequery.endpoint.config";
import { API_ROUTES_CONSTANTS } from "../../lib/constants/routes.constants";

import { DayModalSchemaType } from "../../lib/schema/day.schema";
import daysSlice from "../features/days.slice";
import { RootState } from "../store";

// Define a service using a base URL and expected endpoints
const daysApi = createApi({
  reducerPath: "daysApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Days"],
  endpoints: (builder) => ({
    updateActivity: builder.mutation<DayModalSchemaType, DayModalSchemaType>({
      query: (data) => ({
        url: API_ROUTES_CONSTANTS.updateActivity,
        method: "post",
        data,
      }),
      async onQueryStarted(
        _queryParam,
        { dispatch, queryFulfilled, getState }
      ) {
        const state = getState() as RootState;
        const oldState =
          state?.days?.entities?.[_queryParam?.dayId || ""] || null;
        dispatch(daysSlice.actions.upsertOne(_queryParam));
        try {
          await queryFulfilled;
        } catch (err) {
          if (oldState) {
            dispatch(daysSlice.actions.upsertOne(oldState));
          }
        }
      },
      invalidatesTags: (result) =>
        // is result available?
        result // successful query
          ? [
              { type: "Days", id: result?.dayId } as const,
              { type: "Days", id: "LIST" },
            ]
          : [{ type: "Days", id: "LIST" }],
    }),
  }),
});
// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useUpdateActivityMutation } = daysApi;

export default daysApi;
