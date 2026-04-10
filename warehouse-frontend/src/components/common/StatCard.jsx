import { cn } from "@/utils/cn";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * StatCard — KPI card for dashboard
 *
 * @param {string}  title
 * @param {string|number} value
 * @param {ReactNode} icon
 * @param {string}  description
 * @param {number}  trend      — % change (positive = up, negative = down)
 * @param {"amber"|"green"|"red"|"blue"} color
 * @param {boolean} loading
 */
export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  color = "amber",
  loading = false,
  className,
}) {
  const colorMap = {
    amber: {
      icon:  "text-[var(--color-brand)] bg-[var(--color-brand-subtle)]",
      glow:  "hover:shadow-[0_0_20px_rgb(245_158_11_/_0.08)]",
      bar:   "bg-[var(--color-brand)]",
    },
    green: {
      icon:  "text-[var(--color-success)] bg-[var(--color-success-subtle)]",
      glow:  "hover:shadow-[0_0_20px_rgb(16_185_129_/_0.08)]",
      bar:   "bg-[var(--color-success)]",
    },
    red: {
      icon:  "text-[var(--color-danger)] bg-[var(--color-danger-subtle)]",
      glow:  "hover:shadow-[0_0_20px_rgb(239_68_68_/_0.08)]",
      bar:   "bg-[var(--color-danger)]",
    },
    blue: {
      icon:  "text-[var(--color-info)] bg-[var(--color-info-subtle)]",
      glow:  "hover:shadow-[0_0_20px_rgb(59_130_246_/_0.08)]",
      bar:   "bg-[var(--color-info)]",
    },
  };

  const c = colorMap[color] ?? colorMap.amber;

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? "text-[var(--color-success)]" : trend < 0 ? "text-[var(--color-danger)]" : "text-[var(--color-text-muted)]";

  if (loading) {
    return (
      <div className={cn(
        "rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] p-5",
        className
      )}>
        <div className="skeleton h-4 w-24 mb-4" />
        <div className="skeleton h-8 w-16 mb-2" />
        <div className="skeleton h-3 w-32" />
      </div>
    );
  }

  return (
    <div className={cn(
      "group relative rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] p-5",
      "transition-all duration-200",
      c.glow,
      "overflow-hidden",
      className
    )}>
      {/* Top accent bar */}
      <div className={cn("absolute top-0 left-0 right-0 h-px", c.bar, "opacity-60")} />

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest font-mono mb-2">
            {title}
          </p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)] tabular-nums leading-none">
            {value ?? "—"}
          </p>
          {description && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 truncate">
              {description}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn("p-2.5 rounded-lg shrink-0", c.icon)}>
            <span className="block [&_svg]:w-5 [&_svg]:h-5">{icon}</span>
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div className={cn("flex items-center gap-1 mt-3 text-xs font-mono", trendColor)}>
          <TrendIcon className="w-3.5 h-3.5" />
          <span>{Math.abs(trend).toFixed(1)}%</span>
          <span className="text-[var(--color-text-muted)]">vs เดือนก่อน</span>
        </div>
      )}
    </div>
  );
}
