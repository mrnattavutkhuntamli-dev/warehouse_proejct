import { RefreshCw } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * ChartCard — wrapper สำหรับ Recharts charts
 * จัดการ loading skeleton, empty state, error state
 */
export function ChartCard({
  title,
  subtitle,
  children,
  loading = false,
  empty = false,
  emptyMessage = "ยังไม่มีข้อมูล",
  height = 280,
  actions,
  className,
}) {
  return (
    <div className={cn(
      "rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]",
      "flex flex-col",
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] font-[var(--font-display)]">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      {/* Body */}
      <div className="flex-1 px-2 pb-4" style={{ minHeight: height }}>
        {loading ? (
          <div className="w-full h-full flex items-center justify-center gap-2">
            <div className="w-full mx-3" style={{ height }}>
              {/* Skeleton bars */}
              <div className="flex items-end gap-2 h-full px-4 pb-6">
                {[65, 80, 45, 90, 55, 70, 40, 85, 60, 75].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t skeleton"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : empty ? (
          <div className="w-full h-full flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-sm text-[var(--color-text-muted)]">{emptyMessage}</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

/**
 * ChartTooltip — custom tooltip styling ให้ match กับ dark theme
 */
export function ChartTooltip({ active, payload, label, formatter, labelFormatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border-strong)] shadow-[var(--shadow-lg)] px-3 py-2.5 text-xs">
      {label != null && (
        <p className="font-semibold text-[var(--color-text-secondary)] mb-1.5">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[var(--color-text-muted)]">{entry.name}:</span>
          <span className="font-bold font-mono text-[var(--color-text-primary)] ml-auto pl-3">
            {formatter ? formatter(entry.value, entry.name) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}
