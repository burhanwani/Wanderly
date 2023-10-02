import axios from "axios";
import { consolePrinter } from "../../utils/ui.utils";
import { getUrl } from "./utils.endpoint.config";

export const axiosInstance = axios.create({
  baseURL: location.origin,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

// Intercept all requests
axiosInstance.interceptors.request.use(
  (config) => {
    consolePrinter(() =>
      console.info(
        `%c ${
          config.method !== undefined
            ? config.method.toUpperCase()
            : "undefined"
        } - ${getUrl(config)}:`,
        "color: #0086b3; font-weight: bold",
        config,
      ),
    );
    return config;
  },
  (error) => Promise.reject(error),
);

// Intercept all responses
axiosInstance.interceptors.response.use(
  async (response) => {
    consolePrinter(() =>
      console.info(
        `%c ${response.status} - ${getUrl(response.config)}:`,
        "color: #008000; font-weight: bold",
        response,
      ),
    );
    return response;
  },
  (error) => {
    if (error.response) {
      consolePrinter(() =>
        console.error(
          `%c ${error.response.status} - ${getUrl(error.response.config)}:`,
          "color: #a71d5d; font-weight: bold",
          error.response,
        ),
      );
    } else {
      error = {
        ...error,
        response: {
          ...(error?.response || {}),
          status: 503,
          message: "503 Service Unavailable",
        },
      };
      consolePrinter(() =>
        console.error(
          `%c 503 Service Unavailable `,
          "color: #a71d5d; font-weight: bold",
        ),
      );
    }
    return Promise.reject(error);
  },
);
