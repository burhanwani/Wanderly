import { RootState } from "@/redux/store";
import {
  PayloadAction,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import { TripModalSchemaType } from "../../lib/schema/trip.schema";

const tripsAdapter = createEntityAdapter<TripModalSchemaType>({
  selectId: (trip: TripModalSchemaType) => trip.tripId,
});

const tripsSlice = createSlice({
  name: "trips",
  initialState: tripsAdapter.getInitialState(),
  reducers: {
    upsertMany(state, action: PayloadAction<TripModalSchemaType[]>) {
      tripsAdapter.upsertMany(state, action.payload);
    },
    upsertOne(state, action: PayloadAction<TripModalSchemaType>) {
      tripsAdapter.upsertOne(state, action);
    },
  },
});

export const selectTripsEntities = (state: RootState) => state.trips.entities;

export const selectTripById = (
  state: RootState,
  id: TripModalSchemaType["tripId"] | undefined
) => (typeof id == "number" ? state.trips.entities[id] : null);
export default tripsSlice;
