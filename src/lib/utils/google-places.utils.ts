import { GoogleEndPoints } from "../constants/google.constants";

const GOOGLE_MAP_API_KEY = process?.env?.GOOGLE_MAP_API_KEY || "";

export const generateGoogleUrl = (
  baseUrl: GoogleEndPoints,
  queryParameter: { [key: string]: string | number } = {}
) => {
  const queryParameterString = Object.entries(queryParameter)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return baseUrl + "?" + queryParameterString + `&key=${GOOGLE_MAP_API_KEY}`;
};
