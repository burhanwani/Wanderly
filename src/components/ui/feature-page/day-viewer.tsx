import {
  useMemo,
  useCallback,
  RefObject,
  Dispatch,
  SetStateAction,
} from "react";

import { Label } from "../label";
import { TabsContent } from "../tabs";
import {
  DragDropContext,
  DropResult,
  Droppable,
  ResponderProvided,
} from "@hello-pangea/dnd";
import humanizeDuration from "humanize-duration";
import date from "date-and-time";
import { onlyDigitWithOutText } from "../../../lib/utils/ui.utils";

import { TypographyH4 } from "../typography";
import { DayItineraryViewer } from "./day-itinerary-viewer";
import { useAppSelector } from "../../../redux/hooks";
import { useUpdateActivityMutation } from "../../../redux/services/days.services";
import { startTimeSchema } from "../../../lib/schema/day.schema";
import { useToast } from "../use-toast";
import { ValidationError } from "yup";
import { TimePickerInternal } from "../time-picker";
import moment, { Moment } from "moment";
import ActivityLoader from "./activity-loader";
import { Card, CardDescription, CardTitle } from "../card";
import { Button } from "../button";
import { useUpdateTripV2Mutation } from "../../../redux/services/trips.services";
import { format, setHours, setMinutes } from "date-fns";
import { sendGAEvent } from "../../../lib/config/google-analytics/google-analytics.config";
import { useSession } from "next-auth/react";
import { MarkerClickRef } from "../../page/feature-page";
import { ActivityModalSchemaTypeV2 } from "../../../lib/schema/day.v2.schema";
import { Separator } from "../separator";
import ConciergeGoogleMap from "../google-maps";
import { useWindowWidth } from "@react-hook/window-size";

interface IDayViewer {
  day: string;
  index: number;
  setActivity: Dispatch<SetStateAction<ActivityModalSchemaTypeV2 | null>>;
}
export const TIME_FORMAT = "HH:mm";
export const ONE_MILLISECOND_IN_SECOND = 1000;

function DayViewer({ day, index, setActivity }: IDayViewer) {
  const { data } = useSession();
  const { toast } = useToast();
  const [updateActivity, dragAndDropResult] = useUpdateActivityMutation();
  const [generateActivity, generateActivityResult] = useUpdateTripV2Mutation();
  const dayConfig = useAppSelector((state) => {
    return state.days.entities[day] || null;
  });
  const tripEntity = useAppSelector(
    (state) => state.trips.entities[dayConfig?.tripId || ""] || null
  );
  const startTimeParsed = useMemo(
    () => date.parse(dayConfig?.startTime || "09:00", TIME_FORMAT),
    [dayConfig?.startTime]
  );
  const onDragEnd = useCallback(
    (result: DropResult, provided: ResponderProvided) => {
      const destinationIndex = result?.destination?.index || 0;
      const sourceIndex = result?.source?.index || 0;
      if (destinationIndex == sourceIndex) return;
      // Update backend and redux store
      if (dayConfig) {
        const newActivities = [...(dayConfig?.activities || [])];
        const [removed] = newActivities?.splice(sourceIndex, 1);
        newActivities?.splice(destinationIndex, 0, removed);
        updateActivity({ ...dayConfig, activities: newActivities })
          .unwrap()
          .then(() => {
            sendGAEvent(
              "Main_Feature_Page_Activity_DND",
              "Activity was dragged and dropped by user in Main page"
            );
          })
          .catch((err) => {
            sendGAEvent(
              "Main_Feature_Page_Activity_DND_Failed",
              "Failed : Activity was dragged and dropped by user in Main page",
              err?.toString(),
              data?.user?.id
            );
            toast({
              title: "Something went wrong while saving activity order",
              variant: "destructive",
            });
          });
      }
    },
    [data?.user?.id, dayConfig, toast, updateActivity]
  );
  const dateFnsStartTime = useMemo(() => {
    const timeString = dayConfig?.startTime || "09:00";
    const [hours, minutes] = timeString.split(":").map(Number);

    const dateWithTime = setMinutes(setHours(new Date(), hours), minutes);
    return dateWithTime;
  }, [dayConfig?.startTime]);
  const timingConfig = useMemo(() => {
    return (dayConfig?.activities || []).reduce(
      (config, now, index) => {
        const startTimeInDate =
          index == 0 ? startTimeParsed : config?.[index - 1]?.travelTimeParsed;
        const allocatedTimeInMilliseconds =
          ((now?.duration_seconds as number) || 0) * ONE_MILLISECOND_IN_SECOND;
        const travelDuration =
          (now?.duration_details?.rows?.[0]?.elements?.[0]?.duration
            ?.value! as number) || 0;

        const endTimeInDate = date.addSeconds(
          startTimeInDate,
          (now?.duration_seconds as number) || 0
        );
        const travelEstimateDate = date.addSeconds(
          endTimeInDate,
          travelDuration
        );
        const allocatedTimeEstimateFormatted = humanizeDuration(
          allocatedTimeInMilliseconds,
          {
            units: ["h"],
          }
        );
        const allocatedHour = onlyDigitWithOutText(
          allocatedTimeInMilliseconds,
          {
            units: ["h"],
          }
        ).trim();
        const travelTimeFormatted = humanizeDuration(
          travelDuration * ONE_MILLISECOND_IN_SECOND
        );
        const dateConfig = {
          startTime: date.format(startTimeInDate, "HH:mm A"),
          endTime: date.format(endTimeInDate, "HH:mm A"),
          travelTime: date.format(travelEstimateDate, "HH:mm A"),
          allocatedTimeEstimateFormatted,
          travelTimeParsed: travelEstimateDate,
          allocatedHour,
          travelTimeFormatted,
        };
        config[index] = dateConfig;
        return config;
      },
      {} as {
        [key: number]: {
          startTime: string;
          endTime: string;
          travelTime: string;
          allocatedTimeEstimateFormatted: string;
          travelTimeParsed: Date;
          allocatedHour: string;
          travelTimeFormatted: string;
        };
      }
    );
  }, [dayConfig?.activities, startTimeParsed]);

  const startTimeOnChange = useCallback(
    (newValue: Date | null) => {
      try {
        const timeString = format(newValue as Date, TIME_FORMAT);
        const startTimeValidated = startTimeSchema.validateSync(timeString);
        if (dayConfig) {
          updateActivity({ ...dayConfig, startTime: startTimeValidated })
            .unwrap()
            .then(() => {})
            .catch((err) => {
              sendGAEvent(
                "Main_Feature_Page_Activity_Update_Start_Time_Failed",
                "Failed : Activity start time update by user in Main page",
                err?.toString(),
                data?.user?.id
              );
            });
        } else {
          sendGAEvent(
            "Main_Feature_Page_Day_Wrong_Start_Time",
            "User set bad start time"
          );
          throw new Error("Invalid Day Config");
        }
      } catch (err) {
        sendGAEvent(
          "Main_Feature_Page_Day_Wrong_Start_Time",
          "User set bad start time"
        );
        if (err instanceof ValidationError) {
          toast({
            title: err?.message,
            variant: "destructive",
          });
        }
      }
    },
    [data?.user?.id, dayConfig, toast, updateActivity]
  );

  const generateActivityCallback = useCallback(() => {
    generateActivity({
      tripId: dayConfig?.tripId!,
      dayNumber: index + 1,
      dayId: day,
    })
      .unwrap()
      .then(() => {
        sendGAEvent(
          "Main_Feature_Page_New_Day_Generated",
          "A new day was generated by user"
        );
      })
      .catch((err) => {
        sendGAEvent(
          "Main_Feature_Page_New_Day_Failure",
          "A new day generation failed by user",
          err?.toString(),
          data?.user?.id
        );
      });
  }, [data?.user?.id, day, dayConfig?.tripId, generateActivity, index]);
  const position = useMemo(() => {
    return {
      lat: tripEntity?.location?.lat ?? 0,
      lng: tripEntity?.location.lng ?? 0,
    };
  }, [tripEntity?.location?.lat, tripEntity?.location.lng]);
  const onlyWidth = useWindowWidth();
  const isMobile = useMemo(() => onlyWidth < 500, [onlyWidth]);
  if (generateActivityResult.isLoading) {
    return (
      <TabsContent value={day}>
        <div className="p-6 text-wrap flex items-center justify-center">
          This should only take around 20-25 seconds...
        </div>
        <ActivityLoader />
      </TabsContent>
    );
  }
  if (dayConfig?.isDayGenerated == false)
    return (
      <TabsContent value={day}>
        <div className="mt-4 p-4 bg-muted h-full rounded-lg min-h-[75vh] flex flex-row items-center justify-center">
          <Card className="flex flex-col p-6 gap-6">
            <CardTitle>
              Let&apos;s build your itinerary for Day {index + 1}!
            </CardTitle>
            <CardDescription className="flex items-center justify-center">
              <Button onClick={generateActivityCallback}>
                Auto-generate day
              </Button>
            </CardDescription>
          </Card>
        </div>
      </TabsContent>
    );

  return (
    <TabsContent value={day}>
      {/* <div className="flex justify-between items-center">
        <div className="flex w-full">
          <TypographyH4>Overview</TypographyH4>
        </div>
        <div className="flex w-full items-center justify-end">
          <Button variant={"secondary"}>
            <ListRestart className="mr-2" /> Replan Day
          </Button>
        </div>
      </div> */}
      {/* <DetailViewer detail={day?.overview || "-"} />
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="justify-start hover:no-underline">
            <TypographyH4 className="w-fit">Suggestions</TypographyH4>
            <ChevronDown className="ml-2 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200" />
          </AccordionTrigger>
          <AccordionContent>
            <DetailViewer detail={day?.suggestions || "-"} />
          </AccordionContent>
        </AccordionItem>
      </Accordion> */}
      <div className="flex justify-between items-center w-full">
        <div className="w-6/12 md:w-8/12">
          <TypographyH4>Itinerary</TypographyH4>
        </div>
        <div className="flex items-center justify-end gap-x-4 w-6/12 md:w-5/12">
          <Label className="">Start of day :</Label>
          {/* <Input
            type="time"
            className="w-46"
            value={dayConfig?.startTime || ""}
            onChange={startTimeOnChange}
          /> */}
          <TimePickerInternal<Date>
            onChange={startTimeOnChange}
            value={dateFnsStartTime}
          />
        </div>
      </div>
      <div className="mt-4 p-4 bg-muted h-full rounded-lg min-h-[65vh] flex flex-col-reverse md:flex-col w-full">
        <div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={`${day}`}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex gap-y-4 flex-col"
                >
                  {dayConfig?.activities?.map((plan, index) => (
                    <DayItineraryViewer
                      day={dayConfig}
                      plan={plan}
                      index={index}
                      key={plan.placeId}
                      timingConfig={timingConfig}
                      dragAndDropLoading={dragAndDropResult.isLoading}
                      setActivity={setActivity}
                    />
                  ))}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        {isMobile && (
          <div className="flex md:hidden w-full mb-4">
            {tripEntity && day != "" && (
              <ConciergeGoogleMap
                initialPosition={position}
                currentDay={day}
                className="md:rounded-lg rounded-l-lg md:rounded-l-none w-full border-border"
                setActivity={setActivity}
              />
            )}
          </div>
        )}
      </div>
    </TabsContent>
  );
}
DayViewer.displayName = "DayViewer";
export default DayViewer;
