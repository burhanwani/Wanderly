"use client";
import { useParams, useRouter } from "next/navigation";
import AuthChecker from "../layout/auth";
import { Main } from "../layout/main";
import { useCallback, useEffect, useState } from "react";
import { useLazyGetPlaceDetailQuery } from "../../redux/services/google.services";
import Loader from "../ui/loader";
import { TypographyH3 } from "../ui/typography";
import { useAppSelector } from "../../redux/hooks";
import { TripBasicDetailsDialog } from "../ui/feature-page/trip-basic-detail-dialog";
import { useCreateTripV2Mutation } from "../../redux/services/trips.services";
import { ROUTES_CONSTANTS } from "../../lib/constants/routes.constants";
import { TripBasicDetailsDialogForm } from "../../lib/schema/city-builder-form.schema";
import { useToast } from "../ui/use-toast";
import {
  isAdminUser,
  isBetaLimitReached,
} from "../../lib/config/app/app.config";
import { useSession } from "next-auth/react";

function CityBuilderPage() {
  const session = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { city = "" } = useParams();
  const [fetchCity, cityResult] = useLazyGetPlaceDetailQuery();
  const [createTrip, tripResult] = useCreateTripV2Mutation();
  const isBetaLimitReachedFlag = useAppSelector((state) => {
    if (isAdminUser(session)) return false;
    return isBetaLimitReached(Object.keys(state.trips.entities).length || 0);
  });
  const placeDetails = useAppSelector(
    (state) => state.google.places.entities[city as string]
  );
  useEffect(() => {
    if (typeof city == "string") fetchCity(city);
  }, [city, fetchCity]);
  const onSubmit = useCallback(
    (data: TripBasicDetailsDialogForm) => {
      createTrip(data)
        .unwrap()
        .then((response) =>
          router.push(
            ROUTES_CONSTANTS.tripBuilder(
              city as string,
              response?.tripDetails?.tripId
            )
          )
        )
        .catch(() => {
          toast({
            title: "Something went wrong while creating trip",
            variant: "destructive",
          });
        });
    },
    [city, createTrip, router, toast]
  );
  if (isBetaLimitReachedFlag) {
    return (
      <AuthChecker>
        <Main className="items-center justify-center gap-y-2">
          <TypographyH3>{"You have reached beta limit."}</TypographyH3>
        </Main>
      </AuthChecker>
    );
  }
  return (
    <AuthChecker>
      <Main className="items-center justify-center gap-y-2">
        {(cityResult?.isLoading || session.status == "loading") && <Loader />}
        {cityResult?.isError && (
          <TypographyH3>{"Invalid City Passed"}</TypographyH3>
        )}
        {cityResult.isSuccess && (
          <>
            {tripResult?.isUninitialized && (
              <TripBasicDetailsDialog
                placeId={city as string}
                isOpen={tripResult?.isUninitialized}
                placeName={placeDetails?.result?.name ?? ""}
                onSuccess={onSubmit}
              />
            )}
            {tripResult?.isLoading && (
              <Loader>
                <div className="p-6 text-wrap flex items-center justify-center">
                  This should only take around 20-25 seconds...
                </div>
              </Loader>
            )}
            {tripResult?.isError && (
              <TypographyH3>
                {
                  "Something went wrong while creating trip. Please try again later."
                }
              </TypographyH3>
            )}
          </>
        )}
      </Main>
    </AuthChecker>
  );
}

export default CityBuilderPage;
