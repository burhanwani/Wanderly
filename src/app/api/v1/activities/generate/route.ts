import { getServerSession } from "next-auth";
import { ChatCompletionRequestMessage } from "openai-edge";
import { getPlaceDetail } from "../../../../../lib/backend/services/places.backend.services";
import { nextAuthOptions } from "../../../../../lib/config/auth/next-auth.config";
import { openAi } from "../../../../../lib/config/open-ai/open-ai.config";
import { RESPONSE_CONSTANTS } from "../../../../../lib/constants/response.constants";
import { generateActivitiesRequestPayloadSchema } from "../../../../../lib/schema/generate-activities.schema";

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
  try {
    const payload = await request.json();
    let validatedPayload = null;
    try {
      validatedPayload =
        generateActivitiesRequestPayloadSchema.validateSync(payload);
    } catch (err) {
      return RESPONSE_CONSTANTS[400];
    }
    const session = await getServerSession(nextAuthOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return RESPONSE_CONSTANTS[401];
    }
    const placeDetails = await getPlaceDetail(validatedPayload.placeId);
    if (placeDetails?.status != "OK")
      return RESPONSE_CONSTANTS[400]("Invalid Place ID");
    console.log("placeDetails", placeDetails);
    const messages = getMessage(placeDetails?.result?.name);
    console.log("messages", messages);
    const res = await openAi.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
      user: userId,
      stream: false,
    });
    console.log("res", res);
    const response = await res.json();
    console.log("response", JSON.stringify(response));
    const activities = response?.choices[0]?.message?.content;
    console.log("activities", JSON.parse(activities));
    return RESPONSE_CONSTANTS[200];
  } catch (err) {
    console.log("error", err);
  }
}
