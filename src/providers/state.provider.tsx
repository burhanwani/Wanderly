"use client";

import { useEffect } from "react";
import { store } from "../redux/store";
import { Provider } from "react-redux";
import {
  initGA,
  logPageView,
} from "../lib/config/google-analytics/google-analytics.config";
import { useSession } from "next-auth/react";

interface IApplicationStateProvider {
  children: React.ReactNode;
}

/* All the states of redux are accessible 
      because of this global provider and 
      we pass our redux store into it */
export function ApplicationStateProvider({
  children,
}: IApplicationStateProvider) {
  const session = useSession();
  useEffect(() => {
    if (!window?.GA_INITIALIZED!) {
      initGA(session.data?.user?.id);
      window.GA_INITIALIZED = true;
    }
    logPageView();
  }, [session.data?.user?.id]);
  return <Provider store={store}>{children}</Provider>;
}
