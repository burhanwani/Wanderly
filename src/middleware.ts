import { ipAddress } from "@vercel/edge";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "./lib/config/upstash/upstash-redis.config";
import { RESPONSE_CONSTANTS } from "./lib/constants/response.constants";
import {
  API_ROUTES_CONSTANTS,
  ROUTES_CONSTANTS,
} from "./lib/constants/routes.constants";

const rateLimitingRoutes = [
  API_ROUTES_CONSTANTS.predictions,
  API_ROUTES_CONSTANTS.place,
];
const rateLimitMiddleware = async (req: NextRequest) => {
  if (!rateLimitingRoutes.includes(req?.nextUrl?.pathname))
    return NextResponse.next();
  const ip = ipAddress(req) || "127.0.0.1";
  const { success, limit, remaining } =
    await rateLimit.googlePrediction.limit(ip);
  if (!success) {
    if (req?.nextUrl?.pathname.startsWith("/api"))
      return RESPONSE_CONSTANTS[429]();
    return NextResponse.redirect(ROUTES_CONSTANTS.rateLimit);
  }
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("X-RateLimit-Limit", limit?.toString());
  requestHeaders.set("X-RateLimit-Remaining", remaining?.toString());
  return NextResponse.next({
    headers: requestHeaders,
  });
};

export default rateLimitMiddleware;
