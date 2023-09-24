import { NextResponse } from "next/server";

const RESPONSE_CONSTANTS = {
  401: (message: string = "Unauthorized") =>
    NextResponse.json({ message }, { status: 401 }),
  400: (message: unknown = "Bad Request") =>
    NextResponse.json({ message }, { status: 400 }),
  404: (message: unknown = "Not Found") =>
    NextResponse.json({ message }, { status: 404 }),
  405: (message: unknown = "Not Allowed") =>
    NextResponse.json({ message }, { status: 405 }),
  429: NextResponse.json(
    {
      message: "Too Many Request. Please try again later.",
    },
    {
      status: 429,
    }
  ),
  500: (message: unknown = "Something went wrong. Please try again later.") =>
    NextResponse.json(
      {
        message: message,
      },
      {
        status: 500,
      }
    ),
  200: (message: unknown = { message: "Success" }) =>
    NextResponse.json(message, { status: 200 }),
};

export { RESPONSE_CONSTANTS };
