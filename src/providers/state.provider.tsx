"use client";

import { store } from "../redux/store";
import { Provider } from "react-redux";

interface IApplicationStateProvider {
  children: React.ReactNode;
}

/* All the states of redux are accessible 
      because of this global provider and 
      we pass our redux store into it */
export function ApplicationStateProvider({
  children,
}: IApplicationStateProvider) {
  return <Provider store={store}>{children}</Provider>;
}
