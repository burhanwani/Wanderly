import axios, { AxiosResponse } from "axios";
import { GoogleEndPoints } from "../../../../../lib/constants/google.constants";
import { RESPONSE_CONSTANTS } from "../../../../../lib/constants/response.constants";
import { GooglePlacesAutocompleteResponseSchemaType } from "../../../../../lib/schema/prediction.schema";
import { generateGoogleUrl } from "../../../../../lib/utils/google-places.utils";

export async function POST(request: Request) {
  const { search } = await request.json();
  const predictions = await getSuggestionsFromServer(search);
  return RESPONSE_CONSTANTS[200](predictions);
}

const getSuggestionsFromServer = async (search: string) => {
  try {
    const url = generateGoogleUrl(GoogleEndPoints.AUTO_COMPLETE, {
      input: search,
      types: "(regions)",
      fields: "place_id,description",
    });
    const response = await axios.get<
      string,
      AxiosResponse<GooglePlacesAutocompleteResponseSchemaType>
    >(url);
    if (response?.data?.status == "OK") {
      return response?.data?.predictions || [];
    }
  } catch (err) {}
  return [];
};
