"use client";
import React, { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { Logo } from "../ui/logo";
import { useAppDispatch } from "../../redux/hooks";
import { useLazyGetTripsQuery } from "../../redux/services/trips.services";
import { TypographyH1, TypographyH3 } from "../ui/typography";
import appConfigSlice from "../../redux/features/auth.slice";
import { Main } from "./main";
import { usePathname } from "next/navigation";
import Loader from "../ui/loader";
import { sendGAEvent } from "../../lib/config/google-analytics/google-analytics.config";

export interface IAuthChecker {
  children: React.ReactNode;
  skipTripsFetch?: boolean;
}

export default function AuthChecker({
  children,
  skipTripsFetch = false,
}: IAuthChecker) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { status, data } = useSession({
    required: true,
    onUnauthenticated: () => {
      sendGAEvent(
        "UNAUTHORIZED_USER",
        `unauthorized user accessing ${pathname}`,
      );
      dispatch(appConfigSlice.actions.clearCache());
      signIn("google", {
        callbackUrl: pathname,
      });
    },
  });
  const [fetchTrips, tripsResult] = useLazyGetTripsQuery();
  useEffect(() => {
    if (status == "authenticated" && skipTripsFetch == false) {
      fetchTrips()
        .then(() => {
          sendGAEvent(
            "Get_My_Trips",
            "All trips for user was loaded",
            "Load all trip",
            data?.user?.id,
          );
        })
        .catch(() => {
          sendGAEvent(
            "Failed_To_Loaded_My_Trips",
            "Failed to load trip for user",
            "Failed to load trip for user",
            data?.user?.id,
          );
        });
    }
  }, [data?.user?.id, fetchTrips, skipTripsFetch, status]);
  if (status == "loading" || tripsResult.isLoading)
    return (
      <Main className="items-center justify-center gap-y-2">
        <Loader />
      </Main>
    );
  if (tripsResult.isError)
    return (
      <Main className="items-center justify-center gap-y-2">
        <TypographyH3>
          Something went wrong while loading all trips. Please try again later.
        </TypographyH3>
      </Main>
    );
  return <>{children}</>;
}
