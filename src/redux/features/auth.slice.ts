import { RootState } from "@/redux/store";
import { createSlice } from "@reduxjs/toolkit";

export interface IAppConfigState {}

const initialState: IAppConfigState = {};

/**
 * Authentication State of Application with functions to change state within this state.
 */
const appConfigSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    clearCache() {},
  },
});

export const selectAppConfig = (state: RootState) => state.app;

export default appConfigSlice;
