import { getServerSession } from "next-auth";
import { ChatCompletionRequestMessage } from "openai-edge";
import { nextAuthOptions } from "../../../../../lib/config/auth/next-auth.config";
import { logError } from "../../../../../lib/config/logger/logger.config";
import { RESPONSE_CONSTANTS } from "../../../../../lib/constants/response.constants";

const getMessage = (location: string): ChatCompletionRequestMessage[] => {
  return [
    {
      content: `Create a JSON response for a comprehensive trip activities in ${location}. Ensure a diverse range of activities, catering to various interests and preferences. Include tourist attractions, hidden gems, dining options, cultural experiences, and outdoor adventures.

For each response, provide an array of minimum 10 and maximum up to 15 activities with their respective details, each represented as a JSON object. Use Google Place Names where available.

[
  {
    "name": "[Activity 1 Name]",
    "google_place_name": "[Google Place Name for Activity 1]",
    "booking": "[Required/Not required/Recommended]",
    "budget": "$[Amount]",
    "description": "[Brief description]",
    "popularity": "[Tourist Hotspot/Hidden Gem]",
    "reasoning": "[Why visit]",
    "tips": "[Visitor tips]"
  },
  {
    "name": "[Activity 2 Name] (Meal time, if applicable)",
    "google_place_name": "[Google Place Name for Activity 2]",
    "booking": "[Required/Not required/Recommended]",
    "budget": "$[Amount]",
    "description": "[Brief description]",
    "popularity": "[Tourist Hotspot/Hidden Gem]",
    "reasoning": "[Why visit]",
    "tips": "[Visitor tips]"
  },
  ... (Continue with up to 13 more activities for this response)
]
`,
      role: "system",
    },
  ];
};

export async function POST(request: Request) {
  const session = await getServerSession(nextAuthOptions);
  const userId = session?.user?.id;
  if (!userId) {
    logError("Unauthenticated v1 day generation");
    return RESPONSE_CONSTANTS[401]();
  }
  logError("v1 day generation", userId);
  return RESPONSE_CONSTANTS[400]();
  // try {
  //   const payload = await request.json();
  //   let validatedPayload = null;
  //   try {
  //     validatedPayload =
  //       generateActivitiesRequestPayloadSchema.validateSync(payload);
  //   } catch (err) {
  //     logError("Wrong payload for day generation", userId);
  //     return RESPONSE_CONSTANTS[400]();
  //   }

  //   const placeDetails = await getPlaceDetail(validatedPayload.placeId);
  //   if (placeDetails?.status != "OK") {
  //     logError("Wrong place Id for day generation", userId);
  //     return RESPONSE_CONSTANTS[400]("Invalid Place ID");
  //   }
  //   const messages = getMessage(placeDetails?.result?.name);
  //   const res = await openAi.createChatCompletion({
  //     model: "gpt-3.5-turbo",
  //     messages,
  //     temperature: 0.7,
  //     user: userId,
  //     stream: false,
  //   });
  //   const response = await res.json();
  //   const activities = response?.choices[0]?.message?.content;
  //   return RESPONSE_CONSTANTS[200]();
  // } catch (err) {
  //   if (err instanceof ValidationError) {
  //     logError(
  //       `Day Generation Failed | Integration Validation Failed`,
  //       userId,
  //       err
  //     );
  //     return RESPONSE_CONSTANTS[400](err.message);
  //   } else {
  //     logError(`Something went wrong while generation day`, userId, err);
  //   }
  // }
  // return RESPONSE_CONSTANTS[500]();
}
