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
import { useCreateTripMutation } from "../../redux/services/trips.services";
import { ROUTES_CONSTANTS } from "../../lib/constants/routes.constants";
import { TripBasicDetailsDialogForm } from "../../lib/schema/city-builder-form.schema";
import { useToast } from "../ui/use-toast";

function CityBuilderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { city = "" } = useParams();
  const [fetchCity, cityResult] = useLazyGetPlaceDetailQuery();
  const [createTrip, tripResult] = useCreateTripMutation();

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
  return (
    <AuthChecker>
      <Main className="items-center justify-center gap-y-2">
        {cityResult?.isLoading && <Loader />}
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
            {tripResult?.isLoading && <Loader />}
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
