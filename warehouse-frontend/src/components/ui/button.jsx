import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  // Base
  [
    "inline-flex items-center justify-center gap-2",
    "text-sm font-medium",
    "rounded-md",
    "border border-transparent",
    "transition-all duration-150",
    "cursor-pointer select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]",
    "disabled:opacity-40 disabled:cursor-not-allowed",
    "active:scale-[0.98]",
  ],
  {
    variants: {
      variant: {
        // Primary — amber brand
        default: [
          "bg-[var(--color-brand)] text-[var(--color-text-inverse)]",
          "hover:bg-[var(--color-brand-dim)]",
          "font-semibold tracking-wide",
        ],
        // Destructive
        destructive: [
          "bg-[var(--color-danger)] text-white",
          "hover:bg-red-600",
        ],
        // Outlined
        outline: [
          "border-[var(--color-border-strong)] bg-transparent text-[var(--color-text-primary)]",
          "hover:bg-[var(--color-surface-2)] hover:border-[var(--color-text-muted)]",
        ],
        // Ghost
        ghost: [
          "bg-transparent text-[var(--color-text-secondary)]",
          "hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]",
        ],
        // Secondary surface
        secondary: [
          "bg-[var(--color-surface-3)] text-[var(--color-text-primary)]",
          "border-[var(--color-border)]",
          "hover:bg-[var(--color-border)] hover:border-[var(--color-border-strong)]",
        ],
        // Subtle amber
        brand: [
          "bg-[var(--color-brand-subtle)] text-[var(--color-brand)]",
          "border-[var(--color-brand-muted)]",
          "hover:bg-[var(--color-brand-muted)] hover:text-[var(--color-brand)]",
        ],
        // Danger ghost
        "ghost-destructive": [
          "bg-transparent text-[var(--color-danger)]",
          "hover:bg-[var(--color-danger-subtle)]",
        ],
      },
      size: {
        xs:      "h-7 px-2.5 text-xs rounded",
        sm:      "h-8 px-3 text-xs",
        default: "h-9 px-4",
        lg:      "h-10 px-5 text-base",
        xl:      "h-12 px-6 text-base",
        icon:    "h-9 w-9 p-0",
        "icon-sm": "h-7 w-7 p-0",
        "icon-lg": "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 100 24v-4l-3 3 3 3v4a12 12 0 000-24z" />
          </svg>
        )}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
