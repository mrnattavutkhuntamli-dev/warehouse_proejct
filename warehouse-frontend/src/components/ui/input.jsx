import * as React from "react";
import { cn } from "@/utils/cn";

const Input = React.forwardRef(
  ({ className, type = "text", prefix, suffix, error, ...props }, ref) => {
    if (prefix || suffix) {
      return (
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 flex items-center text-[var(--color-text-muted)] pointer-events-none">
              {prefix}
            </span>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              "h-9 w-full rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)]",
              "text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
              "transition-colors duration-150",
              "focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              error && "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]",
              prefix ? "pl-9" : "pl-3",
              suffix ? "pr-9" : "pr-3",
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 flex items-center text-[var(--color-text-muted)] pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "h-9 w-full rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)]",
          "px-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
          "transition-colors duration-150",
          "focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          error && "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
