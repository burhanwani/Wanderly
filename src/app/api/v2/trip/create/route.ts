import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { ChatCompletionRequestMessage } from "openai-edge";
import { InferType, ValidationError } from "yup";
import { getPlaceDetail } from "../../../../../lib/backend/services/places.backend.services";
import {
  createTripV2,
  getTripsLength,
} from "../../../../../lib/backend/services/trips.backend.services";
import {
  isAdminUser,
  isBetaLimitReached,
} from "../../../../../lib/config/app/app.config";
import { nextAuthOptions } from "../../../../../lib/config/auth/next-auth.config";
import {
  logDevDebug,
  logError,
} from "../../../../../lib/config/logger/logger.config";
import { openAi } from "../../../../../lib/config/open-ai/open-ai.config";
import { RESPONSE_CONSTANTS } from "../../../../../lib/constants/response.constants";
import { cityBuilderModalSchema } from "../../../../../lib/schema/city-builder-form.schema";
import { chatGptTripItineraryResponseSchemaV2 } from "../../../../../lib/schema/open-ai.v2.schema";

// const getUserInput = (data: cityBuilderFormType) => {
//   const days = `Please generate itinerary for ${data?.days} days`;
//   const withStatement =
//     data?.tripWith == TripWith.Solo
//       ? " alone."
//       : " with " + data?.tripWith + ".";
//   const activities = `${
//     data?.activityTypes?.length > 0
//       ? "\nI would love to spend my time on activities like " +
//         data?.activityTypes?.join(",") +
//         "."
//       : ""
//   }`;
//   return days + withStatement + activities;
// };

const getMultiDayItinerary = (
  location: string,
  data: cityBuilderFormType
) => `Create a JSON response for ${data?.days} days trip itinerary in ${location}. Ensure a diverse range of activities, catering to various interests and preferences, over a span of several days. Include tourist attractions, hidden gems, dining options, cultural experiences, and outdoor adventures.

For each response, provide a JSON object with day numbers as keys and arrays of activity objects. Each day should include one breakfast, one lunch, and one dinner activity, along with one additional activity during a particular time of day. Each activity object should include a "time_of_day" field to categorize it as morning, noon, or evening. Use Google Place Names where available.

Additionally, provide an estimated time in seconds to be spent on each activity.

json

{
  "[Day number 1]": [
    {
      "name": "[Breakfast] at [Breakfast Place Name]",
      "time_of_day": "morning",
      "google_place_name": "[Google Place Name for Breakfast]",
      "booking": "[Required/Not required/Recommended]",
      "budget": "$[Amount]",
      "duration_seconds": "[Estimated duration in seconds]",
      "description": "Enjoy a delicious breakfast at [Breakfast Place Name].",
      "popularity": "[Tourist Hotspot/Hidden Gem]",
      "reasoning": "[Why visit]",
      "tips": "[Visitor tips]"
    },
    {
      "name": "[Morning Activity Name]",
      "time_of_day": "morning",
      "google_place_name": "[Google Place Name for Morning Activity]",
      "booking": "[Required/Not required/Recommended]",
      "budget": "$[Amount]",
      "duration_seconds": "[Estimated duration in seconds]",
      "description": "[Brief description]",
      "popularity": "[Tourist Hotspot/Hidden Gem]",
      "reasoning": "[Why visit]",
      "tips": "[Visitor tips]"
    },
    {
      "name": "[Lunch] at [Lunch Place Name]",
      "time_of_day": "noon",
      "google_place_name": "[Google Place Name for Lunch]",
      "booking": "[Required/Not required/Recommended]",
      "budget": "$[Amount]",
      "duration_seconds": "[Estimated duration in seconds]",
      "description": "Savor a delightful lunch at [Lunch Place Name].",
      "popularity": "[Tourist Hotspot/Hidden Gem]",
      "reasoning": "[Why visit]",
      "tips": "[Visitor tips]"
    },
    {
      "name": "[Noon Activity Name]",
      "time_of_day": "noon",
      "google_place_name": "[Google Place Name for Noon Activity]",
      "booking": "[Required/Not required/Recommended]",
      "budget": "$[Amount]",
      "duration_seconds": "[Estimated duration in seconds]",
      "description": "[Brief description]",
      "popularity": "[Tourist Hotspot/Hidden Gem]",
      "reasoning": "[Why visit]",
      "tips": "[Visitor tips]"
    },
    {
      "name": "[Dinner] at [Dinner Place Name]",
      "time_of_day": "evening",
      "google_place_name": "[Google Place Name for Dinner]",
      "booking": "[Required/Not required/Recommended]",
      "budget": "$[Amount]",
      "duration_seconds": "[Estimated duration in seconds]",
      "description": "Indulge in a delightful dinner at [Dinner Place Name].",
      "popularity": "[Tourist Hotspot/Hidden Gem]",
      "reasoning": "[Why visit]",
      "tips": "[Visitor tips]"
    },
    {
      "name": "[Evening Activity Name]",
      "time_of_day": "evening",
      "google_place_name": "[Google Place Name for Evening Activity]",
      "booking": "[Required/Not required/Recommended]",
      "budget": "$[Amount]",
      "duration_seconds": "[Estimated duration in seconds]",
      "description": "[Brief description]",
      "popularity": "[Tourist Hotspot/Hidden Gem]",
      "reasoning": "[Why visit]",
      "tips": "[Visitor tips]"
    }
  ],
  "[Day number 2]": [
    {
      "name": "[Breakfast] at [Breakfast Place Name]",
      "time_of_day": "morning",
      "google_place_name": "[Google Place Name for Breakfast]",
      "booking": "[Required/Not required/Recommended]",
      "budget": "$[Amount]",
      "duration_seconds": "[Estimated duration in seconds]",
      "description": "Start your day with a scrumptious breakfast at [Breakfast Place Name].",
      "popularity": "[Tourist Hotspot/Hidden Gem]",
      "reasoning": "[Why visit]",
      "tips": "[Visitor tips]"
    },
    {
      "name": "[Morning Activity Name]",
      "time_of_day": "morning",
      "google_place_name": "[Google Place Name for Morning Activity]",
      "booking": "[Required/Not required/Recommended]",
      "budget": "$[Amount]",
      "duration_seconds": "[Estimated duration in seconds]",
      "description": "[Brief description]",
      "popularity": "[Tourist Hotspot/Hidden Gem]",
      "reasoning": "[Why visit]",
      "tips": "[Visitor tips]"
    },
    {
      "name": "[Lunch] at [Lunch Place Name]",
      "time_of_day": "noon",
      "google_place_name": "[Google Place Name for Lunch]",
      "booking": "[Required/Not required/Recommended]",
      "budget": "$[Amount]",
      "duration_seconds": "[Estimated duration in seconds]",
      "description": "Enjoy a satisfying lunch at [Lunch Place Name].",
      "popularity": "[Tourist Hotspot/Hidden Gem]",
      "reasoning": "[Why visit]",
      "tips": "[Visitor tips]"
    },
    {
      "name": "[Noon Activity Name]",
      "time_of_day": "noon",
      "google_place_name": "[Google Place Name for Noon Activity]",
      "booking": "[Required/Not required/Recommended]",
      "budget": "$[Amount]",
      "duration_seconds": "[Estimated duration in seconds]",
      "description": "[Brief description]",
      "popularity": "[Tourist Hotspot/Hidden Gem]",
      "reasoning": "[Why visit]",
      "tips": "[Visitor tips]"
    },
    {
      "name": "[Dinner] at [Dinner Place Name]",
      "time_of_day": "evening",
      "google_place_name": "[Google Place Name for Dinner]",
      "booking": "[Required/Not required/Recommended]",
      "budget": "$[Amount]",
      "duration_seconds": "[Estimated duration in seconds]",
      "description": "Wrap up your day with a delicious dinner at [Dinner Place Name].",
      "popularity": "[Tourist Hotspot/Hidden Gem]",
      "reasoning": "[Why visit]",
      "tips": "[Visitor tips]"
    },
    {
      "name": "[Evening Activity Name]",
      "time_of_day": "evening",
      "google_place_name": "[Google Place Name for Evening Activity]",
      "booking": "[Required/Not required/Recommended]",
      "budget": "$[Amount]",
      "duration_seconds": "[Estimated duration in seconds]",
      "description": "[Brief description]",
      "popularity": "[Tourist Hotspot/Hidden Gem]",
      "reasoning": "[Why visit]",
      "tips": "[Visitor tips]"
    }
  ]
}
`;

const getPerDayItinerary = (
  location: string,
  data: cityBuilderFormType,
  removeAdditionInformation = false
) => {
  const additionalInformation = removeAdditionInformation
    ? ""
    : `"booking": "[Required/Not required/Recommended]",
      "budget": "$[Amount]",      
      "popularity": "[Tourist Hotspot/Hidden Gem]",
      "reasoning": "[Why visit]",
      "tips": "[Visitor tips]"`;
  return `
Create a JSON response for the 1st day of a ${data.days} days trip itinerary in ${location}. Ensure a diverse range of activities, catering to various interests and preferences. Include tourist attractions, hidden gems, dining options, cultural experiences, and outdoor adventures.

For the 1st day, provide a JSON object with day number "1" and an array of activity objects. Each day should include one breakfast, one lunch, and one dinner activity, along with one additional activity during a particular time of day. Each activity object should include a "time_of_day" field to categorize it as morning, noon, or evening. Use Google Place Names where available.

Additionally, provide an estimated time in seconds to be spent on each activity. Please replace data between square brackets to actual value and do not append activity time to activity name like "Morning Activity:", "Evening Activity:", etc.

json

{
  "1": [
    {
      "name": "[Breakfast] at [Breakfast Place Name]",
      "time_of_day": "morning",
      "google_place_name": "[Google Place Name for Breakfast]",
      "description": "Enjoy a delicious breakfast at [Breakfast Place Name].",
      "duration_seconds": "[Estimated duration in seconds]",      
      ${additionalInformation}
    },
    {
      "name": "[Morning Activity Name]",
      "time_of_day": "morning",
      "google_place_name": "[Google Place Name for Morning Activity]",
      "duration_seconds": "[Estimated duration in seconds]",
      "description": "[Brief description]",
      ${additionalInformation}
    },
    {
      "name": "[Lunch] at [Lunch Place Name]",
      "time_of_day": "noon",
      "google_place_name": "[Google Place Name for Lunch]",
      "duration_seconds": "[Estimated duration in seconds]",
      "description": "Savor a delightful lunch at [Lunch Place Name].",
      ${additionalInformation}
    },
    {
      "name": "[Noon Activity Name]",
      "time_of_day": "noon",
      "google_place_name": "[Google Place Name for Noon Activity]",
      "duration_seconds": "[Estimated duration in seconds]",
      "description": "[Brief description]",
      ${additionalInformation}
    },
    {
      "name": "[Dinner] at [Dinner Place Name]",
      "time_of_day": "evening",
      "google_place_name": "[Google Place Name for Dinner]",
      "duration_seconds": "[Estimated duration in seconds]",
      "description": "Indulge in a delightful dinner at [Dinner Place Name].",
      ${additionalInformation}
    },
    {
      "name": "[Evening Activity Name]",
      "time_of_day": "evening",
      "google_place_name": "[Google Place Name for Evening Activity]",
      "duration_seconds": "[Estimated duration in seconds]",
      "description": "[Brief description]",
      ${additionalInformation}
    }
  ]
}
`;
};

const getPerDayItineraryOptimized = (
  location: string,
  data: cityBuilderFormType,
  removeAdditionInformation = false
) => `Craft a 1-day of ${
  data.days
} day ${location} trip itinerary in JSON. Include diverse activities: tourist spots, hidden gems, meals, cultural experiences, and outdoor adventures. For each activity, specify the time of day (morning, noon, evening), Google Place Name, estimated duration in seconds, and other relevant details.

json

{
  "1": [
    {
      "name": "[Breakfast] at [Place]",
      "time_of_day": "morning",
      "google_place_name": "[Google Place]",
      "duration_seconds": "[Duration]",
      "description": "Breakfast at [Place].",      
      ${
        removeAdditionInformation
          ? ""
          : `"booking": "[Required/Not required/Recommended]",
      "budget": "$[Amount]",      
      "popularity": "[Tourist Hotspot/Hidden Gem]",
      "reasoning": "[Why visit]",
      "tips": "[Visitor tips]"`
      }
    },
    {
      "name": "[Morning Activity]",
      "time_of_day": "morning",
      ...
    },
    {
      "name": "[Lunch] at [Place]",
      "time_of_day": "noon",
      ...
    },
    {
      "name": "[Noon Activity]",
      "time_of_day": "noon",
      ...
    },
    {
      "name": "[Dinner] at [Place]",
      "time_of_day": "evening",
      ...
    },
    {
      "name": "[Evening Activity]",
      "time_of_day": "evening",
      ...
    }
  ]
}

Replace placeholders (e.g., [Breakfast]) with actual values.`;

const getMessage = (
  location: string,
  data: cityBuilderFormType
): ChatCompletionRequestMessage[] => {
  //   const userInput = getUserInput(data);
  const prompt = getPerDayItinerary(location, data);
  return [
    {
      content: prompt,
      role: "system",
    },
  ];
};
type cityBuilderFormType = InferType<typeof cityBuilderModalSchema>;

export async function POST(req: NextRequest) {
  const session = await getServerSession(nextAuthOptions);
  const userId = session?.user?.id;
  if (!userId) {
    logError("Unauthenticated v1 day generation");
    return RESPONSE_CONSTANTS[401]();
  }
  console.time(`Create trip for ${userId}`);

  try {
    const json = await req.json();
    const data = await cityBuilderModalSchema.validate(json);
    const placeDetails = await getPlaceDetail(data?.placeId);
    const length = await getTripsLength(userId);
    if (isBetaLimitReached(length) && !isAdminUser(session?.user?.email)) {
      logError("v2 day generation | Trip Limit Hit", userId);
      return RESPONSE_CONSTANTS[401]("Only 3 trips are allowed in beta");
    }
    if (placeDetails?.status != "OK") {
      logError(
        `v2 day generation | Invalid Place Id : ${data?.placeId}`,
        userId
      );
      return RESPONSE_CONSTANTS[400]("Invalid Place ID");
    }
    const messages = getMessage(placeDetails?.result?.name, data);
    const res = await openAi.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
      user: userId,
      stream: false,
    });
    const daysResponse = await res.json();
    logDevDebug("v2 day generation | ChatGpt Response", daysResponse);
    const days = daysResponse?.choices[0]?.message?.content;
    const parsedDays = JSON.parse(days);
    const validatedDays =
      chatGptTripItineraryResponseSchemaV2.validateSync(parsedDays);
    logDevDebug(
      "v2 day generation | ChatGpt Parsed & Validated Response",
      validatedDays
    );
    if (daysResponse?.choices[0]?.message)
      messages.push(daysResponse?.choices[0]?.message);
    const trip = await createTripV2(
      validatedDays,
      userId,
      placeDetails,
      messages,
      data.days
    );
    console.timeEnd(`Create trip for ${userId}`);
    return RESPONSE_CONSTANTS[200](trip);
  } catch (err) {
    if (err instanceof ValidationError) {
      logError(`v2 day generation | Invalid Payload`, userId, err);
      return RESPONSE_CONSTANTS[400](err.message);
    } else {
      logError(`v2 day generation | Unknown Error`, userId, err);
    }
  }
  return RESPONSE_CONSTANTS[500]();
}
