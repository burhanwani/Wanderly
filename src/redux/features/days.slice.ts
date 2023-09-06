import { RootState } from "@/redux/store";
import {
  PayloadAction,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import { DayModalSchemaType } from "../../lib/schema/day.schema";

const daysAdapter = createEntityAdapter<DayModalSchemaType>({
  selectId: (day: DayModalSchemaType) => day.dayId,
});

const daysSlice = createSlice({
  name: "days",
  initialState: daysAdapter.getInitialState(),
  reducers: {
    upsertMany(state, action: PayloadAction<DayModalSchemaType[]>) {
      daysAdapter.upsertMany(state, action.payload);
    },
    upsertOne(state, action: PayloadAction<DayModalSchemaType>) {
      daysAdapter.upsertOne(state, action.payload);
    },
    updateStartTime(
      state,
      action: PayloadAction<{
        dayId: DayModalSchemaType["dayId"];
        startTime: DayModalSchemaType["startTime"];
      }>
    ) {},
  },
});

export const selectTripsEntities = (state: RootState) => state.days.entities;

export const selectTripDaysById = (
  state: RootState,
  id: DayModalSchemaType["dayId"] | undefined
) => (typeof id == "number" ? state.days.entities[id] : null);
export default daysSlice;
