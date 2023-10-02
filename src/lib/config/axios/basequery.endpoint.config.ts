import { BaseQueryFn } from "@reduxjs/toolkit/dist/query/react";
import axios, { AxiosError, AxiosRequestConfig } from "axios";

export type AxiosBaseQueryArg = { baseUrl: string };

export const axiosBaseQuery =
  (
    { baseUrl }: AxiosBaseQueryArg = {
      baseUrl: process?.env?.NEXT_HOST_URL ?? "",
    },
  ): BaseQueryFn<
    {
      url: string;
      method: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
      withCredentials?: AxiosRequestConfig["withCredentials"];
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params, withCredentials = false }) => {
    try {
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        withCredentials,
      });
      return { data: result.data };
    } catch (axiosError) {
      let err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
