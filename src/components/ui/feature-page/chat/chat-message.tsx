import { Message } from "ai/react/dist";
import { cn } from "../../../../lib/utils/ui.utils";
import { BrainCircuit, User } from "lucide-react";
import { MemoizedReactMarkdown } from "../../markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { TypographyP } from "../../typography";
import { CodeBlock } from "../../code-block";
import { ChatMessageActions } from "./chat-message-actions";
import React from "react";
import {
  CodeComponent,
  ReactMarkdownNames,
  SpecialComponents,
} from "react-markdown/lib/ast-to-react";

export interface ChatMessageProps {
  message: Message;
}

export interface DefaultChildren {
  children: React.ReactNode;
}

function ChatMessageP({ children }: DefaultChildren) {
  return <TypographyP className="mb-2 last:mb-0">{children}</TypographyP>;
}

// function ChatMessageCode({
//   node,
//   inline,
//   className,
//   children,
//   ...props
// }: SpecialComponents) {
//   if (children?.length) {
//     if (children?.[0] == "▍") {
//       return <span className="mt-1 animate-pulse cursor-default">▍</span>;
//     }

//     children[0] = (children?.[0] as string).replace("`▍`", "▍");
//   }

//   const match = /language-(\w+)/.exec(className || "");

//   if (inline) {
//     return (
//       <code className={className} {...props}>
//         {children}
//       </code>
//     );
//   }

//   return (
//     <CodeBlock
//       key={Math.random()}
//       language={(match && match[1]) || ""}
//       value={String(children).replace(/\n$/, "")}
//       {...props}
//     />
//   );
// }

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  return (
    <div className={cn("group relative mb-4 flex items-start")} {...props}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow",
          message.role === "user"
            ? "bg-background"
            : "bg-primary text-primary-foreground"
        )}
      >
        {message.role === "user" ? <User /> : <BrainCircuit />}
      </div>
      <div className="ml-4 flex-1 space-y-2 px-1">
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            p: ChatMessageP,
            code({ node, inline, className, children, ...props }) {
              if (children?.length) {
                if (children?.[0] == "▍") {
                  return (
                    <span className="mt-1 animate-pulse cursor-default">▍</span>
                  );
                }

                children[0] = (children?.[0] as string).replace("`▍`", "▍");
              }

              const match = /language-(\w+)/.exec(className ?? "");

              if (inline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }

              return (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ""}
                  value={String(children).replace(/\n$/, "")}
                  {...props}
                />
              );
            },
          }}
        >
          {message.content}
        </MemoizedReactMarkdown>
        {/* <ChatMessageActions message={message} /> */}
      </div>
    </div>
  );
}
