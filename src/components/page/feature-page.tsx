import { useParams } from "next/navigation";
import {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
  createRef,
  SetStateAction,
} from "react";
import AuthChecker from "../layout/auth";
import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Main } from "../layout/main";
import ConciergeGoogleMap from "../ui/google-maps";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import DayViewer from "../ui/feature-page/day-viewer";
import { TypographyH1, TypographyH3 } from "../ui/typography";
import { Separator } from "../ui/separator";
import { useAppSelector } from "../../redux/hooks";
import { useGetTripQuery } from "../../redux/services/trips.services";
import { tripIdParamSchema } from "../../lib/schema/trip.schema";
import { ConciergePlayer } from "../ui/player";
import { MAP_LOADING_ANIMATION } from "../../lib/config/ui/loaders.ui.config";
import ActivityLoader from "../ui/feature-page/activity-loader";
import { sendGAEvent } from "../../lib/config/google-analytics/google-analytics.config";
import { useSession } from "next-auth/react";
import { ActivityModalSchemaTypeV2 } from "../../lib/schema/day.v2.schema";
import { ActivityViewer } from "../ui/feature-page/activity-viewer";

export type MarkerClickRef = {
  onMarkerClick: null | ((activity: ActivityModalSchemaTypeV2) => {});
};

export default function MainFeaturePage() {
  const session = useSession();
  const params = useParams();
  const tripId = useMemo(() => {
    try {
      return tripIdParamSchema.validateSync(params?.tripId || null);
    } catch (err) {
      return null;
    }
  }, [params?.tripId]);

  const { isLoading, isError, isSuccess, data, error } = useGetTripQuery(
    tripId || "",
    {
      skip: tripId == null,
    }
  );
  const tripEntity = useAppSelector((state) =>
    tripId ? state.trips.entities[tripId] : null
  );

  const position = useMemo(() => {
    return {
      lat: data?.tripDetails?.location?.lat ?? 0,
      lng: data?.tripDetails?.location.lng ?? 0,
    };
  }, [data?.tripDetails?.location?.lat, data?.tripDetails?.location.lng]);

  const [currentDay, setCurrentDay] = useState<string>(
    tripEntity?.days?.[0] || ""
  );

  const setCurrentDayOnClick = useCallback(
    (day: string) => {
      sendGAEvent(
        "Main_Feature_Page_Day_Changed",
        "Day Changed by user in Main page",
        tripEntity?.placeName,
        session?.data?.user?.id
      );
      setCurrentDay(() => day);
    },
    [session?.data?.user?.id, tripEntity?.placeName]
  );

  useEffect(() => {
    if (isSuccess && tripEntity?.days?.[0]) {
      setCurrentDay(() => tripEntity?.days?.[0] || "");
    }
    if (isSuccess && tripEntity) {
      sendGAEvent("Main_Feature_Page_Loaded", "Main page opened");
    }
  }, [isSuccess, tripEntity, tripEntity?.days]);
  const [activity, setActivity] = useState<ActivityModalSchemaTypeV2 | null>(
    null
  );
  return (
    <AuthChecker>
      <Main className="items-start gap-y-2">
        {isSuccess && currentDay && (
          <>
            <Card className="h-full w-full flex flex-col md:flex-row items-stretch justify-between mt-4">
              <div className="flex h-full w-full md:w-8/12 items-start flex-col justify-start p-4 max-h-[90vh] overflow-y-auto">
                <div className="flex w-full items-start flex-col">
                  <TypographyH3>
                    {tripEntity?.days?.length}{" "}
                    {tripEntity?.days?.length || 0 > 1 ? "days" : "day"} Trip to{" "}
                    {tripEntity?.placeName}
                  </TypographyH3>
                </div>
                <div className="flex gap-x-4  w-full mt-4">
                  <Tabs
                    defaultValue={currentDay}
                    defaultChecked={true}
                    className="w-full"
                    onValueChange={(newValue) => setCurrentDayOnClick(newValue)}
                  >
                    <TabsList className="w-full" defaultValue={currentDay}>
                      <div className="flex overflow-x-scroll md:overflow-x-auto w-full scroll-p-5 h-full my-4">
                        {tripEntity?.days?.map((day, index) => (
                          <TabsTrigger
                            value={day}
                            key={day}
                            onClick={() => setCurrentDayOnClick(day)}
                          >
                            Day {index + 1}
                          </TabsTrigger>
                        ))}
                      </div>
                    </TabsList>
                    {tripEntity?.days?.map((day, index) => (
                      <DayViewer
                        day={day}
                        key={day}
                        index={index}
                        setActivity={setActivity}
                      />
                    ))}
                  </Tabs>
                </div>
              </div>
              <div className="flex w-full md:w-4/12 ">
                <Separator orientation="vertical" className="hidden md:block" />
                {tripEntity && currentDay != "" && (
                  <ConciergeGoogleMap
                    initialPosition={position}
                    currentDay={currentDay}
                    className="rounded-lg rounded-l-none w-full border-border"
                    setActivity={setActivity}
                  />
                )}
              </div>
              <ActivityViewer activity={activity} setActivity={setActivity} />
            </Card>
          </>
        )}
        {isLoading && (
          <div className="flex items-start gap-y-2 min-h-[70vh] w-full">
            <Card className="h-full w-full flex items-start justify-between mt-4 gap-x-2 p-4">
              <div className="flex flex-col md:w-8/12 gap-4 ">
                <Skeleton className="h-8 flex w-full" />
                <Skeleton className="h-8 flex w-full" />
                <Skeleton className="h-8 flex w-full" />
                <ActivityLoader />
              </div>
              <div className="flex flex-col md:w-4/12 gap-4 items-center justify-center min-h-[80vh] h-full">
                <ConciergePlayer url={MAP_LOADING_ANIMATION} />
              </div>
            </Card>
          </div>
        )}
        {isError && (
          <>
            <Card className="min-h-[90vh] h-full w-full flex items-center justify-center mt-4">
              <TypographyH1>
                {typeof error == "string" ? error : "something went wrong"}
              </TypographyH1>
            </Card>
          </>
        )}
      </Main>
    </AuthChecker>
  );
}
