import {
  Trash,
  Calendar,
  Clock,
  Footprints,
  Map,
  PlusIcon,
} from "lucide-react";
import { useCallback, ChangeEvent, useMemo } from "react";
import { Draggable } from "react-beautiful-dnd";
import { Button } from "../button";
import { Card, CardHeader, CardTitle, CardContent } from "../card";
import { Separator } from "../separator";
import { Input } from "../input";
import { TypographyP } from "../typography";
import { DayModalSchemaType } from "../../../lib/schema/day.schema";
import { useAppSelector } from "../../../redux/hooks";
import { useUpdateActivityMutation } from "../../../redux/services/days.services";
import { number } from "yup";

interface IDayItineraryViewer {
  day: DayModalSchemaType;
  plan: DayModalSchemaType["activities"][0];
  index: number;
  timingConfig: {
    [key: string]: {
      startTime: string;
      endTime: string;
      travelTime: string;
      allocatedTimeEstimateFormatted: string;
      travelTimeParsed: Date;
      allocatedHour: string;
      travelTimeFormatted: string;
    };
  };
}

function hoursToSeconds(hours: unknown) {
  try {
    const validatedHours = number().required().default(1).validateSync(hours);
    return validatedHours * 3600;
  } catch (err) {
    return null;
  }
}
export function DayItineraryViewer({
  day,
  plan,
  index,
  timingConfig,
}: IDayItineraryViewer) {
  const place = useAppSelector(
    (state) => state.google.places.entities[plan?.placeId]
  );
  const [updateActivity] = useUpdateActivityMutation();
  const inputChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value = 1 } = e?.target || 1;
      const seconds = hoursToSeconds(value);
      if (day && seconds != null) {
        const dayToUpdate = {
          ...day,
          activities: day.activities.map((_plan) => {
            const newPlan = { ..._plan };
            if (_plan.placeId == plan.placeId) {
              newPlan.allocatedTime = seconds;
            }
            return newPlan;
          }),
        };
        updateActivity(dayToUpdate);
      }
    },
    [day, plan.placeId, updateActivity]
  );
  // const onDelete = useCallback((_plan) => {
  //   const dayToUpdate = {
  //     ...day,
  //     activities: day.activities.map((_plan) => {
  //       const newPlan = { ..._plan };
  //       if (_plan.placeId == plan.placeId) {
  //         newPlan.allocatedTime = seconds;
  //       }
  //       return newPlan;
  //     }),
  //   };
  //   updateActivity(dayToUpdate);
  // }, []);
  const imageUrl = useMemo(
    () => place?.result?.photos?.[0]?.photo_reference,
    [place?.result?.photos]
  );
  return (
    <>
      <Draggable key={plan.placeId} draggableId={plan.placeId} index={index}>
        {(provided) => {
          return (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <Card className="group hover:border-primary hover:border-2 hover:border-dashed">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="">{plan.name}</div>
                    <Button
                      size={"icon"}
                      variant={"destructive"}
                      className="group-hover:opacity-100 opacity-0 ease-in transition-opacity duration-100"
                      onClick={() => {}}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardContent className="text-sm text-muted-foreground flex flex-col p-0">
                    <div className="flex gap-x-2">
                      <Calendar className="h-5 w-5" />{" "}
                      {timingConfig?.[index]?.startTime} -{" "}
                      {timingConfig?.[index]?.endTime}
                    </div>
                    <div className="flex flex-wrap items-center  tracking-tight gap-x-2">
                      <Clock className="h-5 w-5" /> Allocated Time (~{" "}
                      {timingConfig?.[index]?.allocatedTimeEstimateFormatted}{" "}
                      avg):{" "}
                      <Input
                        name="itinerary.allocatedTime"
                        type="number"
                        className="w-16 mx-2"
                        min={0}
                        max={23}
                        value={timingConfig?.[index]?.allocatedHour}
                        onChange={inputChangeHandler}
                      />{" "}
                      hrs
                    </div>
                    <TypographyP className="!mt-4">
                      {plan?.description}
                    </TypographyP>
                  </CardContent>
                </CardHeader>
                {/* {imageUrl && (
                  <div>
                    <Image
                      src={`https://maps.googleapis.com/maps/api/place/photoimageUrl?maxWidth=400&photoreference=${imageUrl}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}`}
                      alt="Image"
                      width={400}
                      height={100}
                    />
                  </div>
                )} */}
              </Card>
            </div>
          );
        }}
      </Draggable>
      <div className="flex w-full items-center justify-center gap-x-2 h-5">
        <Footprints className="h-5 w-5" />~{" "}
        <TypographyP className="mr-2 !mt-0">
          {timingConfig?.[index]?.travelTimeFormatted}
        </TypographyP>
        <Separator orientation="vertical" className="bg-primary" />
        <Button variant={"link"}>
          <Map className="h-5 w-5 mr-2" />
          Direction
        </Button>
      </div>
      {/* <div className="flex flex-row items-center justify-center w-full"> */}
      {/* <Button variant={"ghost"} className="flex gap-x-2">
        <PlusIcon className="h-5 w-5" /> Add Activity
      </Button> */}
      {/* </div> */}
    </>
  );
}

DayItineraryViewer.displayName = "DayItineraryViewer";
