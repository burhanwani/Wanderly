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
  const { status } = useSession({
    required: true,
    onUnauthenticated: () => {
      dispatch(appConfigSlice.actions.clearCache());
      signIn("google", {
        callbackUrl: pathname,
      });
    },
  });
  const [fetchTrips, tripsResult] = useLazyGetTripsQuery();
  useEffect(() => {
    if (status == "authenticated" && skipTripsFetch == false) {
      fetchTrips();
    }
  }, [fetchTrips, skipTripsFetch, status]);
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
