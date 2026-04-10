import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium tracking-wide font-mono uppercase",
  {
    variants: {
      variant: {
        default:     "bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] border border-[var(--color-border)]",
        brand:       "bg-[var(--color-brand-subtle)] text-[var(--color-brand)] border border-[var(--color-brand-muted)]",
        success:     "bg-[var(--color-success-subtle)] text-[var(--color-success)]",
        warning:     "bg-[var(--color-warning-subtle)] text-[var(--color-warning)]",
        danger:      "bg-[var(--color-danger-subtle)] text-[var(--color-danger)]",
        info:        "bg-[var(--color-info-subtle)] text-[var(--color-info)]",
        // Status-specific
        draft:       "bg-[var(--color-surface-3)] text-[var(--color-text-muted)] border border-[var(--color-border)]",
        approved:    "bg-[var(--color-info-subtle)] text-[var(--color-info)]",
        issued:      "bg-[var(--color-success-subtle)] text-[var(--color-success)]",
        cancelled:   "bg-[var(--color-danger-subtle)] text-[var(--color-danger)]",
        pending:     "bg-[var(--color-warning-subtle)] text-[var(--color-warning)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

// Auto-map status string to variant
const STATUS_VARIANT_MAP = {
  DRAFT:            "draft",
  APPROVED:         "approved",
  ISSUED:           "issued",
  CANCELLED:        "cancelled",
  RECEIVED:         "issued",
  PARTIAL_RECEIVED: "pending",
  AVAILABLE:        "issued",
  BORROWED:         "pending",
  MAINTENANCE:      "info",
  BROKEN:           "cancelled",
  RETIRED:          "draft",
  IN:               "success",
  OUT:              "warning",
  ADJUST:           "info",
  RETURN:           "brand",
  TRANSFER:         "info",
};

function Badge({ className, variant, status, children, ...props }) {
  const resolvedVariant = variant ?? STATUS_VARIANT_MAP[status] ?? "default";
  return (
    <span className={cn(badgeVariants({ variant: resolvedVariant }), className)} {...props}>
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
