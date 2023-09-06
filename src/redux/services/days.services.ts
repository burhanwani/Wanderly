import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../lib/config/axios/basequery.endpoint.config";
import { API_ROUTES_CONSTANTS } from "../../lib/constants/routes.constants";

import { DayModalSchemaType } from "../../lib/schema/day.schema";
import daysSlice from "../features/days.slice";

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
      async onQueryStarted(_queryParam, { dispatch, queryFulfilled }) {
        try {
          const data = await queryFulfilled;
          if (data?.data) dispatch(daysSlice.actions.upsertOne(_queryParam));
        } catch (err) {}
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
