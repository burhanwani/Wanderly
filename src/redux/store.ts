import { combineReducers, configureStore, Reducer } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/dist/query/react";
import appConfigSlice from "./features/auth.slice";
import daysSlice from "./features/days.slice";
import googleSlice from "./features/google.slice";
import tripsSlice from "./features/trips.slice";
import daysApi from "./services/days.services";
import googleApi from "./services/google.services";
import tripApi from "./services/trips.services";

/**
 * Global State of the application
 */
export const combinedReducer = combineReducers({
  [appConfigSlice.name]: appConfigSlice.reducer,
  [tripsSlice.name]: tripsSlice.reducer,
  [googleSlice.name]: googleSlice.reducer,
  [daysSlice.name]: daysSlice.reducer,
  // APIS
  [tripApi.reducerPath]: tripApi.reducer,
  [googleApi.reducerPath]: googleApi.reducer,
  [daysApi.reducerPath]: daysApi.reducer,
});

export const rootReducer: Reducer<RootState> = (state, action) => {
  if (action.type === appConfigSlice.actions.clearCache.type) {
    return combinedReducer(undefined, action);
  }
  return combinedReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(tripApi.middleware)
      .concat(googleApi.middleware)
      .concat(daysApi.middleware),
});

setupListeners(store.dispatch);
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof combinedReducer>;
