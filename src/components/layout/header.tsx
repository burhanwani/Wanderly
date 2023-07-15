import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <header
    ref={ref}
    className={cn(
      "bg-white shadow-sm lg:static lg:overflow-y-visible",
      className
    )}
    {...props}
  >
    <div className="py-4 px-4 sm:px-6 lg:px-8 flex">
      <div>Concierge</div>
      <div></div>
    </div>
  </header>
));
Card.displayName = "Card";
