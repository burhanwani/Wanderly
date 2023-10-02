import { Configuration, OpenAIApi } from "openai-edge";
const OPEN_AI_API_KEY = process.env.OPENAI_API_KEY;
const configuration = new Configuration({
  apiKey: OPEN_AI_API_KEY,
});
export const openAi = new OpenAIApi(configuration);
