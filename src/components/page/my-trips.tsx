import { useCallback, useEffect, useMemo } from "react";
import { useAppSelector } from "../../redux/hooks";
import { selectTripsEntities } from "../../redux/features/trips.slice";
import { Main } from "../layout/main";
import { Card, CardContent, CardHeader } from "../ui/card";
import {
  TypographyH1,
  TypographyH3,
  TypographyH4,
  TypographyLead,
  TypographySmall,
} from "../ui/typography";
import { useRouter } from "next/navigation";
import { ROUTES_CONSTANTS } from "../../lib/constants/routes.constants";
import { TripModalSchemaType } from "../../lib/schema/trip.schema";
import { useToast } from "../ui/use-toast";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { isBetaLimitReached } from "../../lib/config/app/app.config";

function MyTripsPage() {
  const { toast } = useToast();
  const tripEntities = useAppSelector(selectTripsEntities);
  const trips = useMemo(
    () => Object.values(tripEntities || {}),
    [tripEntities]
  );
  const router = useRouter();
  const goToTrip = useCallback(
    (trip?: TripModalSchemaType) => {
      if (trip?.placeId && trip?.tripId) {
        router.push(
          ROUTES_CONSTANTS.tripBuilder(trip?.placeId || "", trip?.tripId || "")
        );
      } else {
        toast({
          title: "Something went wrong while loading trip.",
          variant: "destructive",
        });
      }
    },
    [router, toast]
  );
  return (
    <Main className="items-center justify-center space-y-4">
      {trips?.length > 0 ? (
        <Card className="h-full w-full min-h-[85vh]">
          <CardHeader className="flex flex-row justify-between items-center">
            <TypographyH3>Trips</TypographyH3>
            <div className="flex flex-col justify-center items-center gap-y-2">
              {isBetaLimitReached(trips?.length) ? (
                <Button
                  onClick={() =>
                    toast({
                      title: "Coming soon",
                      variant: "default",
                    })
                  }
                >
                  Upgrade to pro
                </Button>
              ) : (
                <Button onClick={() => router.push(ROUTES_CONSTANTS.home)}>
                  Create a new trip
                </Button>
              )}
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="px-0">
            {trips?.map((trip) => (
              <>
                <div
                  key={trip?.tripId}
                  onClick={() => goToTrip(trip)}
                  className="w-full flex items-center justify-between p-6  cursor-pointer bottom-b hover:bg-secondary"
                >
                  <div>
                    <TypographySmall className="">
                      {trip?.placeName || "-"} trip for{" "}
                      {trip?.days?.length || 0}{" "}
                      {trip?.days?.length || 0 > 1 ? "days" : "day"}
                    </TypographySmall>
                  </div>
                  <div>
                    <Button onClick={() => goToTrip(trip)} variant={"ghost"}>
                      View
                    </Button>
                  </div>
                </div>
                <Separator />
              </>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full flex items-center justify-between p-4 flex-col cursor-pointer gap-5">
          <TypographyH3>No Trips found</TypographyH3>
          <Button onClick={() => router.push(ROUTES_CONSTANTS.home)}>
            Create New Trip
          </Button>
        </Card>
      )}
    </Main>
  );
}

export default MyTripsPage;
