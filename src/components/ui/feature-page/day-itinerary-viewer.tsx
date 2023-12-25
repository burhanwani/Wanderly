import {
  Trash,
  Calendar,
  Clock,
  Map,
  CarFront,
  GripVertical,
} from "lucide-react";
import {
  useCallback,
  ChangeEvent,
  useMemo,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Button } from "../button";
import { Card, CardHeader, CardTitle, CardContent } from "../card";
import { Separator } from "../separator";
import { Input } from "../input";
import { TypographyP } from "../typography";
import { useAppSelector } from "../../../redux/hooks";
import { useUpdateActivityMutation } from "../../../redux/services/days.services";
import { number } from "yup";
import Image from "next/image";
import { buildGooglePhotoApi } from "../../../lib/constants/google.constants";
import {
  ActivityModalSchemaTypeV2,
  DayModalSchemaTypeV2,
} from "../../../lib/schema/day.v2.schema";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../tooltip";

interface IDayItineraryViewer {
  day: DayModalSchemaTypeV2;
  plan: DayModalSchemaTypeV2["activities"][0];
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
  dragAndDropLoading: boolean;
  setActivity: Dispatch<SetStateAction<ActivityModalSchemaTypeV2 | null>>;
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
  dragAndDropLoading,
  setActivity,
}: IDayItineraryViewer) {
  const place = useAppSelector(
    (state) => state.google.places.entities[plan?.placeId!]
  );
  const nextPlace = useAppSelector((state) => {
    const nextPlan = day?.activities?.[index + 1];
    return state.google.places.entities[nextPlan?.placeId!] || null;
  });
  const [updateActivity] = useUpdateActivityMutation();

  const [showDistanceLoading, setShowDistanceLoading] =
    useState<boolean>(false);
  const inputOnClickHandler: React.MouseEventHandler<HTMLInputElement> =
    useCallback((e) => {
      e.stopPropagation();
    }, []);
  const inputChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      const { value = 1 } = e?.target || 1;
      const seconds = hoursToSeconds(value);
      if (day && seconds != null) {
        const dayToUpdate = {
          ...day,
          activities: day.activities.map((_plan) => {
            const newPlan = { ..._plan };
            if (_plan.placeId == plan.placeId) {
              newPlan.duration_seconds = seconds;
            }
            return newPlan;
          }),
        };
        updateActivity(dayToUpdate)
          .unwrap()
          .finally(() => setShowDistanceLoading(() => false));
      }
    },
    [day, plan.placeId, updateActivity]
  );
  const onDelete = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const dayToUpdate = {
        ...day,
        activities: day.activities
          .filter((_plan, _index) => {
            return _plan.placeId != plan.placeId;
          })
          .map((_plan) => ({ ..._plan })),
      };
      updateActivity(dayToUpdate)
        .unwrap()
        .finally(() => setShowDistanceLoading(() => false));
    },
    [day, plan.placeId, updateActivity]
  );
  const imageUrl = useMemo(() => {
    if ((place?.result?.photos || []).length > 0) {
      let photoReference = place?.result?.photos?.[0]?.photo_reference;
      const photo = place?.result?.photos?.find(
        (_photo) => _photo.width > _photo?.height
      );
      if (photo != undefined) photoReference = photo?.photo_reference;
      return buildGooglePhotoApi(448, 250, photoReference);
    }
    return null;
  }, [place?.result?.photos]);

  return (
    <>
      <Draggable key={plan.placeId} draggableId={plan?.placeId!} index={index}>
        {(provided, snapshot) => {
          return (
            <>
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex gap-x-2 items-center">
                        <GripVertical className="md:h-6 md:w-6 h-12 w-12" />
                        <Card
                          className="group flex justify-between hover:border-primary hover:border-2 hover:border-dashed"
                          onClick={() => setActivity(plan)}
                        >
                          <CardHeader className="w-full">
                            <CardTitle className="flex items-center justify-between">
                              <div className="">
                                {(plan?.name as string) || ""}
                              </div>
                              <Button
                                size={"icon"}
                                variant={"destructive"}
                                className="group-hover:opacity-100 opacity-0 ease-in transition-opacity duration-100"
                                onClick={onDelete}
                              >
                                <Trash className="md:h-5 md:w-5 h-4 w-4" />
                              </Button>
                            </CardTitle>
                            <CardContent className="text-sm text-muted-foreground flex flex-col p-0">
                              {imageUrl && (
                                <div className="block md:hidden min-h-[8rem] max-h-full pb-2">
                                  <Image
                                    className="rounded-md max-w-md bg-cover max-h-full h-full min-h-[8rem]"
                                    src={imageUrl}
                                    alt={place?.result?.name || "Place Image"}
                                    width={300}
                                    height={120}
                                    layout="responsive"
                                  />
                                </div>
                              )}
                              <div className="flex gap-x-2">
                                <Calendar className="md:h-5 md:w-5 h-4 w-4" />{" "}
                                {timingConfig?.[index]?.startTime} -{" "}
                                {timingConfig?.[index]?.endTime}
                              </div>
                              <div className="flex flex-wrap items-center  tracking-tight gap-x-2">
                                <Clock className="md:h-5 md:w-5 h-4 w-4" />
                                Allocated Time (~
                                {
                                  timingConfig?.[index]
                                    ?.allocatedTimeEstimateFormatted
                                }{" "}
                                avg):{" "}
                                <Input
                                  name="itinerary.allocatedTime"
                                  type="number"
                                  className="w-20 mx-2"
                                  min={0}
                                  max={23}
                                  step=".01"
                                  value={timingConfig?.[index]?.allocatedHour}
                                  onChange={inputChangeHandler}
                                  onClick={inputOnClickHandler}
                                />{" "}
                                hrs
                              </div>
                              <TypographyP className="!mt-4">
                                {plan?.description as string}
                              </TypographyP>
                            </CardContent>
                          </CardHeader>
                          {imageUrl && (
                            <div className="hidden xl:block min-h-[8rem] max-h-full">
                              <Image
                                className="rounded-r-xl max-w-md bg-cover max-h-full h-full min-h-[8rem]"
                                src={imageUrl}
                                alt={place?.result?.name || "Place Image"}
                                width={300}
                                height={120}
                              />
                            </div>
                          )}
                        </Card>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      Click for more info or Drag and drop to move activities
                      around
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {day?.activities?.length - 1 != index &&
                snapshot.isDragging == false && (
                  <div className="flex flex-col md:flex-row w-full items-center justify-center gap-x-2 md:h-5">
                    <div className="flex items-center gap-x-2">
                      <CarFront className="h-5 w-5" />~{" "}
                      <TypographyP className="mr-2 !mt-0">
                        {showDistanceLoading || dragAndDropLoading
                          ? "Calculating..."
                          : timingConfig?.[index]?.travelTimeFormatted}
                      </TypographyP>
                    </div>
                    <Separator
                      orientation="vertical"
                      className="bg-primary hidden md:block"
                    />
                    <Separator
                      orientation="horizontal"
                      className="bg-primary block md:hidden"
                    />
                    <Button
                      variant={"link"}
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&origin=${place?.result?.formatted_address}&destination=${nextPlace?.result?.formatted_address}`,
                          "_blank"
                        )
                      }
                    >
                      <Map className="h-5 w-5 mr-2" />
                      Direction
                    </Button>
                  </div>
                )}
            </>
          );
        }}
      </Draggable>
    </>
  );
}

DayItineraryViewer.displayName = "DayItineraryViewer";
