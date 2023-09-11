import { googlePlaceDetailResponseSchema } from "../../schema/place-details.schema";
import { getPlaceFromCache, putPlaceInCache } from "../cache/places.cache";
import { getLocationDetailsByPlaceId } from "./google.backend.services";

export async function getPlaceDetail(placeId: string) {
  const data = await getPlaceFromCache(placeId);
  if (data) return data;
  const response = await getLocationDetailsByPlaceId(placeId);
  if (response?.data?.status == "OK") await putPlaceInCache(response?.data);
  return googlePlaceDetailResponseSchema.validateSync(response?.data);
}
