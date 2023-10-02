import React from "react";
import { cn } from "../../lib/utils/ui.utils";

const Main = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { addPadding?: boolean }
>(({ className, addPadding = true, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        "bg-muted pt-body overflow-x-auto w-screen min-h-screen flex flex-col",
        addPadding ? " px-4 sm:px-6 lg:px-8 " : "",
        className,
      )}
      {...props}
    ></main>
  );
});
Main.displayName = "Main";

export { Main };
