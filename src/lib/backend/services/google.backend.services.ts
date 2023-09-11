import axios, { AxiosResponse } from "axios";
import { GoogleEndPoints } from "../../constants/google.constants";
import {
  DistanceMatrixResponseSchemaType,
  distanceMatrixResponseSchema,
} from "../../schema/distance-matrix-api.schema";
import { GooglePlaceDetailResponseType } from "../../schema/place-details.schema";
import {
  GooglePlaceFromTextSchemaType,
  googlePlaceFromTextSchema,
} from "../../schema/place-from-text.schema";
import { GooglePlacesAutocompleteResponseSchemaType } from "../../schema/prediction.schema";
import { generateGoogleUrl } from "../../utils/google-places.utils";
import { getPlaceDetail } from "./places.backend.services";

export const getLocationDetailsByPlaceId = async (
  placeId: GooglePlacesAutocompleteResponseSchemaType["predictions"][0]["place_id"]
) => {
  const url = generateGoogleUrl(GoogleEndPoints.PLACE_DETAILS, {
    place_id: placeId,
  });
  const response = await axios.get<
    string,
    AxiosResponse<GooglePlaceDetailResponseType>
  >(url);
  return response;
};

export const getPlaceDetailWithImage = async (
  place: string = "",
  region: string = ""
): Promise<GooglePlaceDetailResponseType> => {
  const url = generateGoogleUrl(GoogleEndPoints.FIND_PLACE_FROM_TEXT, {
    input: place,
    inputtype: "textquery",
    fields: "place_id",
    locationbias: `region:${region}`,
  });
  const response = await axios.get<
    string,
    AxiosResponse<GooglePlaceFromTextSchemaType>
  >(url);
  console.log("response?.data", response?.data);
  const validatedResponse = googlePlaceFromTextSchema.validateSync(
    response?.data
  );
  console.log("validatedResponse", validatedResponse);
  const placeDetails = await getPlaceDetail(
    validatedResponse?.candidates?.[0]?.place_id
  );
  return placeDetails;
};

export const getPlaceDetailsWithImageParallel = async (
  placeNames: string[] = [],
  region: string = ""
): Promise<GooglePlaceDetailResponseType[]> => {
  return await Promise.all(
    placeNames?.map(async (name) => getPlaceDetailWithImage(name, region))
  );
};

export const getDistanceMatrixBetweenPlaces = async (
  place: GooglePlaceDetailResponseType,
  nextPlace: GooglePlaceDetailResponseType
): Promise<DistanceMatrixResponseSchemaType | null> => {
  try {
    const url = generateGoogleUrl(GoogleEndPoints.DISTANCE_MATRIX, {
      origins: `${place?.result?.geometry?.location?.lat},${place?.result?.geometry?.location?.lng}`,
      destinations: `${nextPlace?.result?.geometry?.location?.lat},${nextPlace?.result?.geometry?.location?.lng}`,
    });
    const response = await axios.get<
      string,
      AxiosResponse<DistanceMatrixResponseSchemaType>
    >(url);

    const validatedResponse = distanceMatrixResponseSchema.validateSync(
      response?.data
    );
    return validatedResponse;
  } catch (err) {
    console.log("error", err);
    return null;
  }
};

export const getDistanceMatrixBetweenPlacesParallel = async (
  places: GooglePlaceDetailResponseType[] = []
): Promise<(DistanceMatrixResponseSchemaType | null)[]> => {
  const promises = places.map(async (place, index) => {
    if (index == places.length - 1) {
      return Promise.resolve(null);
    }
    if (place == null || places[index + 1] == null)
      return Promise.resolve(null);
    return await getDistanceMatrixBetweenPlaces(place, places[index + 1]);
  });
  return await Promise.all(promises);
};

export function getImageUrlByReference(photoReference: string | null = null) {
  if (photoReference)
    return generateGoogleUrl(GoogleEndPoints.IMAGE, {
      maxWidth: 400,
      photoreference: photoReference,
    });
  return null;
}
