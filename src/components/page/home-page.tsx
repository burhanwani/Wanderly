"use client";
import { Main } from "../layout/main";
import { Card, CardContent, CardHeader } from "../ui/card";
import AutocompleteInput from "../ui/search";
import {
  BACKGROUNDS,
  getRandomBackground,
} from "../../lib/config/ui/home-background.ui.config";

export default function HomePage() {
  return (
    <Main className="items-center justify-center">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center flex-col justify-center w-full">
            <h2 className="text-2xl tracking-tight lg:text-3xl">
              Plan your{" "}
              <span className="home-page-trip-type animate-pulse"> </span> trip
              with AI
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center flex-col justify-center w-full">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              Live more. Plan less.
            </h1>
            <div className="flex w-full border rounded-sm mt-4">
              <AutocompleteInput />
            </div>
          </div>
        </CardContent>
      </Card>
    </Main>
  );
}
