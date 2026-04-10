import { CheckCircle2, Clock, Wrench, AlertTriangle, Archive } from "lucide-react";
import { cn } from "@/utils/cn";

const STATUS_CONFIG = {
  AVAILABLE: {
    label: "ว่าง",
    icon:  CheckCircle2,
    cls:   "bg-[var(--color-success-subtle)] text-[var(--color-success)] border-[var(--color-success)]/20",
  },
  BORROWED: {
    label: "ถูกยืม",
    icon:  Clock,
    cls:   "bg-[var(--color-warning-subtle)] text-[var(--color-warning)] border-[var(--color-warning)]/20",
  },
  MAINTENANCE: {
    label: "ซ่อมบำรุง",
    icon:  Wrench,
    cls:   "bg-[var(--color-info-subtle)] text-[var(--color-info)] border-[var(--color-info)]/20",
  },
  BROKEN: {
    label: "ชำรุด",
    icon:  AlertTriangle,
    cls:   "bg-[var(--color-danger-subtle)] text-[var(--color-danger)] border-[var(--color-danger)]/20",
  },
  RETIRED: {
    label: "เลิกใช้",
    icon:  Archive,
    cls:   "bg-[var(--color-surface-3)] text-[var(--color-text-muted)] border-[var(--color-border)]",
  },
};

export function ToolStatusBadge({ status, className }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.AVAILABLE;
  const Icon = cfg.icon;
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border font-mono uppercase tracking-wide",
      cfg.cls,
      className
    )}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}
