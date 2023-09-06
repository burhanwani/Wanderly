import { Card } from "../card";
import { Skeleton } from "../skeleton";

export default function ActivityLoader() {
  return (
    <Skeleton className="h-full flex flex-col w-full p-4 gap-4">
      <Card className="h-full w-full flex items-start justify-between flex-col gap-4 p-4">
        <Skeleton className="h-8 flex w-full" />
        <Skeleton className="h-8 flex w-full" />
        <Skeleton className="h-8 flex w-full" />
        <Skeleton className="h-16 flex w-full" />
      </Card>
      <div className="flex w-full items-center justify-center">
        <div className="w-2/4 items-center justify-center flex gap-x-4">
          <Skeleton className="h-8 flex w-2/4" /> |{" "}
          <Skeleton className="h-8 flex w-2/4" />
        </div>
      </div>
      <Card className="h-full w-full flex items-start justify-between flex-col gap-4 p-4">
        <Skeleton className="h-8 flex w-full" />
        <Skeleton className="h-8 flex w-full" />
        <Skeleton className="h-8 flex w-full" />
        <Skeleton className="h-16 flex w-full" />
      </Card>
    </Skeleton>
  );
}
