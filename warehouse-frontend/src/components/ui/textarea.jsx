import * as React from "react";
import { cn } from "@/utils/cn";

const Textarea = React.forwardRef(({ className, error, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[80px] w-full rounded-md resize-y",
      "bg-[var(--color-surface-2)] border border-[var(--color-border)]",
      "px-3 py-2 text-sm text-[var(--color-text-primary)]",
      "placeholder:text-[var(--color-text-muted)]",
      "transition-colors duration-150",
      "focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]",
      "disabled:opacity-40 disabled:cursor-not-allowed",
      error && "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
