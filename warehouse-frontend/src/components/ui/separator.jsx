import * as React from "react";
import { cn } from "@/utils/cn";

const Separator = React.forwardRef(({ className, orientation = "horizontal", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-[var(--color-border)]",
      orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
      className
    )}
    {...props}
  />
));
Separator.displayName = "Separator";

export { Separator };
