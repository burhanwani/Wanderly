import React from "react";
import { cn } from "../../lib/utils/ui.utils";
import { Badge } from "./badge";

const Logo = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    className={cn(
      "scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-3xl flex gap-x-2",
      className
    )}
    ref={ref}
    {...props}
  >
    Wanderly
    <span>
      <Badge variant="outline">Beta</Badge>
    </span>
  </h1>
));
Logo.displayName = "Logo";
export { Logo };
