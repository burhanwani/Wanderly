import { RootState } from "@/redux/store";
import {
  PayloadAction,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import { DayModalSchemaType } from "../../lib/schema/day.schema";
import { DayModalSchemaTypeV2 } from "../../lib/schema/day.v2.schema";

const daysAdapter = createEntityAdapter<DayModalSchemaTypeV2>({
  selectId: (day: DayModalSchemaTypeV2) => day.dayId,
});

const daysSlice = createSlice({
  name: "days",
  initialState: daysAdapter.getInitialState(),
  reducers: {
    upsertMany(state, action: PayloadAction<DayModalSchemaTypeV2[]>) {
      daysAdapter.upsertMany(state, action.payload);
    },
    upsertOne(state, action: PayloadAction<DayModalSchemaTypeV2>) {
      daysAdapter.upsertOne(state, action.payload);
    },
  },
});

export const selectTripsEntities = (state: RootState) => state.days.entities;

export const selectTripDaysById = (
  state: RootState,
  id: DayModalSchemaType["dayId"] | undefined,
) => (typeof id == "number" ? state.days.entities[id] : null);
export default daysSlice;
