export enum GoogleEndPoints {
  AUTO_COMPLETE = "https://maps.googleapis.com/maps/api/place/autocomplete/json",
  PLACE_DETAILS = "https://maps.googleapis.com/maps/api/place/details/json",
  NEAR_BY_SEARCH = "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
  FIND_PLACE_FROM_TEXT = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json",
  DISTANCE_MATRIX = "https://maps.googleapis.com/maps/api/distancematrix/json",
  IMAGE = "https://maps.googleapis.com/maps/api/place/photo",
}

export const buildGooglePhotoApi = (
  maxWidth = 400,
  maxHeight = 100,
  photoReference = "",
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY
) => {
  return (
    GoogleEndPoints.IMAGE +
    "?maxwidth=" +
    maxWidth +
    "&maxheigth=" +
    maxHeight +
    "&photo_reference=" +
    photoReference +
    "&key=" +
    apiKey
  );
};
