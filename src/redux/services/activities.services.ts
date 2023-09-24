import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../lib/config/axios/basequery.endpoint.config";
import { API_ROUTES_CONSTANTS } from "../../lib/constants/routes.constants";

// Define a service using a base URL and expected endpoints
const activitiesApi = createApi({
  reducerPath: "activitiesApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: [],
  endpoints: (builder) => ({
    generateActivities: builder.query<undefined, string>({
      query: (placeId: string = "") => ({
        url: API_ROUTES_CONSTANTS.generateActivities,
        method: "post",
        data: { placeId },
      }),
    }),
  }),
});
// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useLazyGenerateActivitiesQuery } = activitiesApi;

export default activitiesApi;
