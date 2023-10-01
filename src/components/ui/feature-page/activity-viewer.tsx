import {
  Clock,
  CreditCard,
  FileScan,
  LocateIcon,
  Star,
  XIcon,
} from "lucide-react";
import { Button } from "../button";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { ActivityModalSchemaTypeV2 } from "../../../lib/schema/day.v2.schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../tooltip";
import { buildGooglePhotoApi } from "../../../lib/constants/google.constants";
import { TypographyH4, TypographyRegular } from "../typography";
import Image from "next/image";
import { useAppSelector } from "../../../redux/hooks";
import { ONE_MILLISECOND_IN_SECOND } from "./day-viewer";
import humanizeDuration from "humanize-duration";
import { cn } from "../../../lib/utils/ui.utils";
interface IActivityViewer {
  activity: ActivityModalSchemaTypeV2 | null;
  setActivity: Dispatch<SetStateAction<ActivityModalSchemaTypeV2 | null>>;
}
export function ActivityViewer({ activity, setActivity }: IActivityViewer) {
  const place = useAppSelector(
    (state) =>
      state.google.places.entities[(activity?.placeId! as string) || ""]
  );
  const [currentImage, setCurrentImage] = useState<number>(0);
  const images = useMemo(() => {
    console.log("activity", activity, place);
    return (place?.result?.photos || [])
      ?.filter((image) => image.width > image?.height)
      .map((image) => {
        return buildGooglePhotoApi(500, 250, image.photo_reference);
      });
  }, [activity, place]);

  const allocatedTimeEstimateFormatted = useMemo(() => {
    const allocatedTimeInMilliseconds =
      ((activity?.duration_seconds as number) || 0) * ONE_MILLISECOND_IN_SECOND;
    return humanizeDuration(allocatedTimeInMilliseconds, {
      units: ["h"],
    });
  }, [activity?.duration_seconds]);
  return (
    <Dialog open={activity != null} modal={true}>
      <DialogContent className="w-full min-w-[70vw]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <div>{(activity?.name as string) || ""}</div>
            <div>
              <Button
                variant={"ghost"}
                className="flex"
                onClick={() => {
                  setActivity(null);
                  setCurrentImage(0);
                }}
              >
                <XIcon />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-row justify-between gap-4 items-center">
          <div className="flex flex-col gap-2">
            <div className="flex gap-x-2">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger>
                    <LocateIcon className="h-5 w-5" />{" "}
                  </TooltipTrigger>
                  <TooltipContent>Location</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {place?.result?.formatted_address}
            </div>
            {(activity?.booking as string) && (
              <div className="flex gap-x-2">
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger>
                      <FileScan className="h-5 w-5" />{" "}
                    </TooltipTrigger>
                    <TooltipContent>Booking</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                Booking {activity?.booking as string}
              </div>
            )}
            {(activity?.budget as string) && (
              <div className="flex gap-x-2">
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger>
                      <CreditCard className="h-5 w-5" />{" "}
                    </TooltipTrigger>
                    <TooltipContent>Budget</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {activity?.budget as string}
              </div>
            )}
            {(activity?.popularity as string) && (
              <div className="flex gap-x-2">
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Star className="h-5 w-5" />{" "}
                    </TooltipTrigger>
                    <TooltipContent>Popularity</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {activity?.popularity as string}
              </div>
            )}
            <div className="flex flex-wrap items-center  tracking-tight gap-x-2">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger className="flex">
                    <Clock className="h-5 w-5" />
                  </TooltipTrigger>
                  <TooltipContent>Allocated Time</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              ~ {allocatedTimeEstimateFormatted} avg
            </div>

            {(activity?.description as string) && (
              <TypographyRegular className="mt-6">
                <TypographyH4>Description</TypographyH4>
                {activity?.description as string}
              </TypographyRegular>
            )}

            {(activity?.reasoning as string) && (
              <TypographyRegular className="mt-6">
                <TypographyH4>Why we recommended it</TypographyH4>
                {activity?.reasoning as string}
              </TypographyRegular>
            )}

            {(activity?.tips as string) && (
              <TypographyRegular className="mt-6">
                <TypographyH4>Tips</TypographyH4>
                {activity?.tips as string}
              </TypographyRegular>
            )}
          </div>
          {images.length > 0 && (
            <div className="hidden xl:flex w-full xl:flex-col h-full items-center justify-evenly">
              {images.map((image, index) => (
                <Image
                  key={image}
                  className={cn(
                    "rounded-xl max-w-md bg-cover max-h-80 min-h-[20rem]",
                    currentImage == index ? "block" : "hidden"
                  )}
                  loading={"eager"}
                  src={image || ""}
                  alt={(activity?.name as string) || "Place Image"}
                  width={500}
                  height={250}
                />
              ))}

              {images.length > 1 && (
                <>
                  <div>
                    {currentImage + 1} of {images?.length}
                  </div>
                  <div className="flex w-full items-center justify-center gap-4 mt-4">
                    <Button
                      variant={"outline"}
                      onClick={() => {
                        if (currentImage - 1 <= 0) {
                          setCurrentImage(0);
                        } else {
                          setCurrentImage((prev) => prev - 1);
                        }
                      }}
                      disabled={currentImage == 0}
                    >
                      Prev
                    </Button>
                    <Button
                      variant={"outline"}
                      disabled={currentImage + 1 == images.length}
                      onClick={() => {
                        if (currentImage + 1 > images?.length) {
                          setCurrentImage(0);
                        } else {
                          setCurrentImage((prev) => prev + 1);
                        }
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

ActivityViewer.displayName = "ActivityViewer";
