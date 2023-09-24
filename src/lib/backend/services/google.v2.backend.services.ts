import axios, { AxiosResponse } from "axios";
import { GoogleEndPoints } from "../../constants/google.constants";
import {
  ActivityModalSchemaTypeV2,
  activityModalSchemaV2,
} from "../../schema/day.v2.schema";
import { ChatGptTripItineraryResponseTypeV2 } from "../../schema/open-ai.v2.schema";
import {
  GooglePlaceFromTextSchemaType,
  googlePlaceFromTextSchema,
} from "../../schema/place-from-text.schema";
import { generateGoogleUrl } from "../../utils/google-places.utils";
import { getPlaceDetail } from "./places.backend.services";

export const getPlaceDetailFromTextV2 = async (
  activity: ChatGptTripItineraryResponseTypeV2,
  region: string = ""
): Promise<ActivityModalSchemaTypeV2> => {
  const url = generateGoogleUrl(GoogleEndPoints.FIND_PLACE_FROM_TEXT, {
    input: activity.google_place_name + ", " + region,
    inputtype: "textquery",
    fields: "place_id",
    locationbias: `region:${region}`,
  });
  console.log("google find place from text : place , region : ", url);
  const response = await axios.get<
    string,
    AxiosResponse<GooglePlaceFromTextSchemaType>
  >(url);
  const validatedResponse = googlePlaceFromTextSchema.validateSync(
    response?.data
  );
  const placeDetails = await getPlaceDetail(
    validatedResponse?.candidates?.[0]?.place_id
  );
  console.log("GooglePlaceFromTextSchemaType placeDetails", placeDetails);
  return activityModalSchemaV2.validateSync({
    ...activity,
    place_details: placeDetails,
    place_url: url,
  });
};

export const getPlaceDetailsFromTextParallelV2 = async (
  activities: ChatGptTripItineraryResponseTypeV2[] = [],
  region: string = ""
): Promise<ActivityModalSchemaTypeV2[]> => {
  return await Promise.all(
    activities?.map(async (activity) =>
      getPlaceDetailFromTextV2(activity, region)
    )
  );
};

// export const getDistanceMatrixBetweenPlacesV2 = async (
//   place: ActivityModalSchemaTypeV2,
//   nextPlace: ActivityModalSchemaTypeV2
// ): Promise<ActivityModalSchemaTypeV2> => {
//   try {
//     const url = generateGoogleUrl(GoogleEndPoints.DISTANCE_MATRIX, {
//       origins: `${place?.place_details?.result?.geometry?.location?.lat},${place?.place_details?.result?.geometry?.location?.lng}`,
//       destinations: `${nextPlace?.place_details?.result?.geometry?.location?.lat},${nextPlace?.place_details?.result?.geometry?.location?.lng}`,
//     });
//     const response = await axios.get<
//       string,
//       AxiosResponse<DistanceMatrixResponseSchemaType>
//     >(url);

//     const validatedResponse = distanceMatrixResponseSchema.validateSync(
//       response?.data
//     );
//     place.duration_details = validatedResponse;
//     return place;
//   } catch (err) {
//     console.log("error", err);
//     place.duration_details = null;
//     return place;
//   }
// };

// export const getDistanceMatrixBetweenPlacesParallelV2 = async (
//   activities: ActivityModalSchemaTypeV2[] = []
// ): Promise<ActivityModalSchemaTypeV2[]> => {
//   const promises = activities.map(async (activity, index) => {
//     if (index == activities.length - 1) {
//       activity.duration_details = null;
//       return Promise.resolve(activity);
//     }
//     if (activity == null || activities[index + 1] == null) {
//       activity.duration_details = null;
//       return Promise.resolve(activity);
//     }
//     return await getDistanceMatrixBetweenPlacesV2(
//       activity,
//       activities[index + 1]
//     );
//   });
//   return await Promise.all(promises);
// };

export function getImageUrlByReference(photoReference: string | null = null) {
  if (photoReference)
    return generateGoogleUrl(GoogleEndPoints.IMAGE, {
      maxWidth: 400,
      photoreference: photoReference,
    });
  return null;
}
