import { ArrowDownToLine } from "lucide-react";
import { useAtBottom } from "../../lib/hooks/use-at-bottom.hooks";
import { cn } from "../../lib/utils/ui.utils";
import { Button, ButtonProps } from "./button";

export function ButtonScrollToBottom({ className, ...props }: ButtonProps) {
  const isAtBottom = useAtBottom();

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "absolute right-4 top-1 z-10 bg-background transition-opacity duration-300 sm:right-8 md:top-2",
        isAtBottom ? "opacity-0" : "opacity-100",
        className,
      )}
      onClick={() =>
        window.scrollTo({
          top: document.body.offsetHeight,
          behavior: "smooth",
        })
      }
      {...props}
    >
      <ArrowDownToLine />
      <span className="sr-only">Scroll to bottom</span>
    </Button>
  );
}
