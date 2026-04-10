import { cn } from "@/utils/cn";

/**
 * PageHeader — consistent page title bar
 *
 * @param {string}    title
 * @param {string}    subtitle
 * @param {ReactNode} actions   — buttons on the right
 * @param {ReactNode} breadcrumb
 */
export function PageHeader({ title, subtitle, actions, breadcrumb, className }) {
  return (
    <div className={cn(
      "flex items-start justify-between gap-4 pb-5 border-b border-[var(--color-border)]",
      className
    )}>
      <div className="min-w-0">
        {breadcrumb && (
          <div className="text-xs text-[var(--color-text-muted)] font-mono mb-1">
            {breadcrumb}
          </div>
        )}
        <h1 className="text-xl font-bold text-[var(--color-text-primary)] leading-tight font-[var(--font-display)] truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
