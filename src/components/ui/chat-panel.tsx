import { UseChatHelpers } from "ai/react/dist";
import { PromptForm } from "./prompt-form";
import { ButtonScrollToBottom } from "./button-scroll-to-bottom";
import { Button } from "./button";
import { CircleDollarSign, RefreshCw, StopCircle } from "lucide-react";

import { Message } from "ai";
import { RefObject, useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

export interface ChatPanelProps
  extends Pick<
    UseChatHelpers,
    | "append"
    | "isLoading"
    | "reload"
    | "messages"
    | "stop"
    | "input"
    | "setInput"
  > {
  id: string;
}

const functionCall = JSON.stringify({
  name: "get_landmarks",
  description:
    "Get noteworthy landmarks and important keywords from the user input about a particular location to create an itinerary",
  parameters: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "The city and state, e.g. San Francisco, CA",
      },
      keywords: {
        type: "array",
        description: "The type of activities the user is intersted in",
        items: {
          type: "string",
        },
      },
      days: {
        type: "number",
        description:
          "The number of days the user wants to create the itinerary for",
      },
      music_genre: {
        type: "string",
        description:
          "The genre or type of music the user wants to see concerts or shows about",
      },
      cuisine: {
        type: "string",
        description:
          "The type of cuisine the user likes. If the user did not enter anything, then set this to the local cuisine of the location the user has entered",
      },
      type_of_trip: {
        type: "string",
        description:
          "The type of trip for the user as either personal, family or business",
      },
      start_date: {
        type: "string",
        description:
          "The start date when the user wants the trip to start. If the user does not enter anything, default it to today",
      },
    },
    required: ["location", "keywords", "days"],
  },
});

export function ChatPanel({
  id,
  isLoading,
  stop,
  append,
  reload,
  input,
  setInput,
  messages,
}: ChatPanelProps) {
  const userMessagesCount = useMemo(
    () => messages.filter((message) => message.role == "user")?.length || 0,
    [messages]
  );

  return (
    <div className="relative w-full px-2">
      {/* <ButtonScrollToBottom /> */}
      <div className="">
        {/* <div className="flex h-10 items-center justify-center">
          {isLoading ? (
            <Button
              variant="outline"
              onClick={() => stop()}
              className="bg-background"
            >
              <StopCircle className="mr-2" />
              Stop generating
            </Button>
          ) : (
            messages?.length > 0 && (
              <Button
                variant="outline"
                onClick={() => reload()}
                className="bg-background"
              >
                <RefreshCw className="mr-2" />
                Regenerate response
              </Button>
            )
          )}
        </div> */}
        <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          {userMessagesCount > 50 ? (
            <Alert variant={"destructive"}>
              {/* <Terminal className="h-4 w-4" /> */}
              <CircleDollarSign />
              <AlertTitle>Upgrade to premium</AlertTitle>
              <AlertDescription>
                Free users are allowed to send only 5 messages
              </AlertDescription>
            </Alert>
          ) : (
            <PromptForm
              onSubmit={async (value) => {
                const message: Message = {
                  id,
                  content: value,
                  role: "user",
                };
                await append(message);
              }}
              input={input}
              setInput={setInput}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
