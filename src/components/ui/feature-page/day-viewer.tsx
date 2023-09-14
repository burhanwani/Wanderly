import { useMemo, useCallback } from "react";

import { Label } from "../label";
import { TabsContent } from "../tabs";
import {
  DragDropContext,
  DropResult,
  Droppable,
  ResponderProvided,
} from "react-beautiful-dnd";
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

interface IDayViewer {
  day: string;
}
const TIME_FORMAT = "HH:mm";
const ONE_MILLISECOND_IN_SECOND = 1000;

function DayViewer({ day }: IDayViewer) {
  const { toast } = useToast();
  const [updateActivity] = useUpdateActivityMutation();
  const dayConfig = useAppSelector((state) => {
    return state.days.entities[day] || null;
  });
  const startTimeParsed = useMemo(
    () => date.parse(dayConfig?.startTime || "09:00", TIME_FORMAT),
    [dayConfig?.startTime]
  );
  const onDragEnd = useCallback(
    (result: DropResult, provided: ResponderProvided) => {
      const destinationIndex = result?.destination?.index || 0;
      const sourceIndex = result?.source?.index || 0;
      // Update backend and redux store
      if (dayConfig) {
        const newActivities = [...(dayConfig?.activities || [])];
        const [removed] = newActivities?.splice(sourceIndex, 1);
        newActivities?.splice(destinationIndex, 0, removed);
        updateActivity({ ...dayConfig, activities: newActivities })
          .unwrap()
          .catch(() => {
            toast({
              title: "Something went wrong while saving activity order",
              variant: "destructive",
            });
          });
      }
    },
    [dayConfig, toast, updateActivity]
  );
  const momentStartTime = useMemo(() => {
    const now = moment();
    const time = (dayConfig?.startTime || "").split(":");
    if (time.length >= 2) {
      now.hours(parseInt(time?.[0]));
      now.minutes(parseInt(time?.[1]));
    }
    return now;
  }, [dayConfig?.startTime]);
  const timingConfig = useMemo(() => {
    return (dayConfig?.activities || []).reduce(
      (config, now, index) => {
        const startTimeInDate =
          index == 0 ? startTimeParsed : config?.[index - 1]?.travelTimeParsed;
        const allocatedTimeInMilliseconds =
          (now?.allocatedTime || 0) * ONE_MILLISECOND_IN_SECOND;
        const endTimeInDate = date.addSeconds(
          startTimeInDate,
          now?.allocatedTime || 0
        );
        const travelEstimateDate = date.addSeconds(
          endTimeInDate,
          now?.travel?.duration?.value || 0
        );
        const allocatedTimeEstimateFormatted = humanizeDuration(
          allocatedTimeInMilliseconds,
          {
            units: ["h"],
          }
        );

        const allocatedHour = onlyDigitWithOutText(
          allocatedTimeInMilliseconds
        ).trim();
        const travelTimeFormatted = humanizeDuration(
          (now?.travel?.duration?.value || 0) * ONE_MILLISECOND_IN_SECOND
        );

        config[index] = {
          startTime: date.format(startTimeInDate, "HH:mm A"),
          endTime: date.format(endTimeInDate, "HH:mm A"),
          travelTime: date.format(travelEstimateDate, "HH:mm A"),
          allocatedTimeEstimateFormatted,
          travelTimeParsed: travelEstimateDate,
          allocatedHour,
          travelTimeFormatted,
        };
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
    (newValue: Moment) => {
      const parsedStartTime = newValue.format(TIME_FORMAT);
      try {
        const startTimeValidated =
          startTimeSchema.validateSync(parsedStartTime);
        if (dayConfig)
          updateActivity({ ...dayConfig, startTime: startTimeValidated });
        else throw new Error("Invalid Day Config");
      } catch (err) {
        if (err instanceof ValidationError) {
          toast({
            title: err?.message,
            variant: "destructive",
          });
        }
      }
    },
    [dayConfig, toast, updateActivity]
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
        <div className="w-8/12">
          <TypographyH4>Itinerary</TypographyH4>
        </div>
        <div className="flex items-center justify-end gap-x-4 w-4/12">
          <Label className="">Start of day :</Label>
          {/* <Input
            type="time"
            className="w-46"
            value={dayConfig?.startTime || ""}
            onChange={startTimeOnChange}
          /> */}
          <TimePickerInternal
            format={TIME_FORMAT}
            onChange={startTimeOnChange}
            value={momentStartTime}
            allowEmpty={false}
            // className="text-primary bg-background"
          />
        </div>
      </div>
      <div className="mt-4 p-4 bg-muted h-full rounded-lg min-h-[65vh]">
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
                  />
                ))}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </TabsContent>
  );
}
DayViewer.displayName = "DayViewer";
export default DayViewer;
