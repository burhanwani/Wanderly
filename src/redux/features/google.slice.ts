import { RootState } from "@/redux/store";
import {
  PayloadAction,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import { GooglePlaceDetailResponseType } from "../../lib/schema/place-details.schema";
import { GooglePlacesAutocompleteResponseSchemaType } from "../../lib/schema/prediction.schema";

const placesAdapter = createEntityAdapter<GooglePlaceDetailResponseType>({
  selectId: (place: GooglePlaceDetailResponseType) => place?.result?.place_id,
});

const predictionsAdapter = createEntityAdapter<
  GooglePlacesAutocompleteResponseSchemaType["predictions"][0]
>({
  selectId: (
    place: GooglePlacesAutocompleteResponseSchemaType["predictions"][0],
  ) => place?.place_id,
});

/**
 * Authentication State of Application with functions to change state within this state.
 */
const googleSlice = createSlice({
  name: "google",
  initialState: {
    places: placesAdapter.getInitialState(),
    predictions: predictionsAdapter.getInitialState(),
  },
  reducers: {
    upsertManyPlaces(
      state,
      action: PayloadAction<GooglePlaceDetailResponseType[]>,
    ) {
      placesAdapter.upsertMany(state.places, action.payload);
    },
    upsertOnePlace(
      state,
      action: PayloadAction<GooglePlaceDetailResponseType>,
    ) {
      placesAdapter.upsertOne(state.places, action.payload);
    },
    upsertManyPrediction(
      state,
      action: PayloadAction<
        GooglePlacesAutocompleteResponseSchemaType["predictions"]
      >,
    ) {
      predictionsAdapter.upsertMany(state.predictions, action.payload);
    },
  },
});

export const selectPlacesEntities = (state: RootState) =>
  state.google.places.entities;

export const selectPlaceById = (
  state: RootState,
  id: GooglePlaceDetailResponseType["result"]["place_id"] | undefined,
) => (typeof id == "number" ? state.google.places.entities[id] : null);

export const selectPredictionEntities = (state: RootState) =>
  state.google.predictions.entities;

export const selectPredictionById = (
  state: RootState,
  id: GooglePlacesAutocompleteResponseSchemaType["predictions"][0]["place_id"],
) => (typeof id == "number" ? state.google.predictions.entities[id] : null);
export default googleSlice;
