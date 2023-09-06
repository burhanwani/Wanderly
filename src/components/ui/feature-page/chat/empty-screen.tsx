import { UseChatHelpers } from "ai/react/dist";
import { ExternalLink } from "../../external-link";
import { Button } from "../../button";
import { ArrowRight } from "lucide-react";

import { useMemo } from "react";

export function EmptyScreen({
  setInput,
}: Pick<UseChatHelpers, "setInput"> & {}) {
  const exampleMessages: any[] = [];
  // const exampleMessages = useMemo(
  //   () => [
  //     {
  //       heading: "Good Time for trip",
  //       message: `What is the best time to go to ${tripDetails?.placeDetails?.result?.name} ?`,
  //     },
  //     {
  //       heading: "Fun place near by",
  //       message: `What are good vacation places go to near ${tripDetails?.placeDetails?.result?.name} ? \n`,
  //     },
  //     {
  //       heading: "Create a draft itinerary",
  //       message: `Draft an itinerary of ${
  //         tripDetails?.days?.length || 1
  //       } days for ${tripDetails?.placeDetails?.result?.name} ? \n`,
  //     },
  //   ],
  //   [tripDetails?.days, tripDetails?.placeDetails?.result?.name]
  // );
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          Welcome to Concierge AI Chatbot!
        </h1>
        <p className="leading-normal text-muted-foreground">
          You can start a conversation here or try the following examples:
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages?.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <ArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
