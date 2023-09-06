"use client";
import { Message, useChat } from "ai/react";
import { useToast } from "../../use-toast";
import { useRef } from "react";
import { cn } from "../../../../lib/utils/ui.utils";
import { ChatPanel } from "../../chat-panel";
import { EmptyScreen } from "./empty-screen";
import { ChatList } from "./chat-list";
import { ChatScrollAnchor } from "./chat-scroll-anchor";

export interface ChatProps extends React.ComponentProps<"div"> {
  initialMessages?: Message[];
  id: string;
}

export function TripChat({ id, initialMessages, className }: ChatProps) {
  const { toast } = useToast();
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      initialMessages,
      id,
      body: {
        id,
      },
      onResponse(response) {
        if (response.status === 401) {
          toast({
            title: response.statusText,
            variant: "destructive",
          });
        } else if (response.status == 200) {
        }
      },
    });
  return (
    <div className="flex flex-col items-center justify-between w-full h-full">
      <div
        className={cn("pt-4 md:pt-4 h-full overflow-y-auto", className)}
        ref={chatMessagesRef}
      >
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen setInput={setInput} />
        )}
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
      />
    </div>
  );
}
TripChat.displayName = "TripChat";
