import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "../button";
import { DayModalSchemaType } from "../../../lib/schema/day.schema";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card";

interface IAddActivity {
  day: DayModalSchemaType;
  plan: DayModalSchemaType["activities"][0];
  index: number;
}
export function AddActivity({ day, plan, index }: IAddActivity) {
  const [isOpen, setOpen] = useState<boolean>(false);
  return isOpen == false ? (
    <div className="flex flex-row items-center justify-center w-full">
      <Button
        variant={"ghost"}
        className="flex gap-x-2"
        onClick={() => setOpen((_prev) => !_prev)}
      >
        <PlusIcon className="h-5 w-5" /> Add Activity
      </Button>
    </div>
  ) : (
    <Card>
      <CardHeader className="flex-row justify-between">
        <div>New Activity</div>
        <Button
          variant={"ghost"}
          className="flex"
          onClick={() => setOpen((_prev) => !_prev)}
        >
          <XIcon />
        </Button>
      </CardHeader>
      <CardContent>Search</CardContent>
    </Card>
  );
}

AddActivity.displayName = "AddActivity";
