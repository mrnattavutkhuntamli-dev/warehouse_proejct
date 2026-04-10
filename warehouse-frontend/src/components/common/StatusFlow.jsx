import { Check, Circle } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * StatusFlow — แสดง pipeline สถานะแบบ step-by-step
 *
 * @param {Array}  steps   — [{ key, label, icon? }]
 * @param {string} current — key ของ step ปัจจุบัน
 * @param {string} cancelled — key ที่ถือว่า cancelled (แสดงสีแดง)
 */
export function StatusFlow({ steps = [], current, cancelled }) {
  const currentIdx = steps.findIndex((s) => s.key === current);
  const isCancelled = current === cancelled || (cancelled && steps.findIndex(s => s.key === cancelled) === currentIdx);

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, idx) => {
        const isDone      = !isCancelled && idx < currentIdx;
        const isActive    = idx === currentIdx;
        const isCancelledStep = isActive && isCancelled;

        return (
          <div key={step.key} className="flex items-center">
            {/* Step node */}
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all",
                isDone        && "bg-[var(--color-success)] border-[var(--color-success)]",
                isActive && !isCancelledStep && "bg-[var(--color-brand)] border-[var(--color-brand)]",
                isCancelledStep && "bg-[var(--color-danger)] border-[var(--color-danger)]",
                !isDone && !isActive && "bg-[var(--color-surface-2)] border-[var(--color-border)]",
              )}>
                {isDone ? (
                  <Check className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Circle className={cn(
                    "w-2.5 h-2.5",
                    isActive && !isCancelledStep && "text-white fill-white",
                    isCancelledStep && "text-white fill-white",
                    !isDone && !isActive && "text-[var(--color-text-muted)]",
                  )} />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-mono whitespace-nowrap",
                isDone && "text-[var(--color-success)]",
                isActive && !isCancelledStep && "text-[var(--color-brand)] font-bold",
                isCancelledStep && "text-[var(--color-danger)] font-bold",
                !isDone && !isActive && "text-[var(--color-text-muted)]",
              )}>
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < steps.length - 1 && (
              <div className={cn(
                "h-0.5 w-8 mb-5 mx-1 rounded-full transition-all",
                isDone ? "bg-[var(--color-success)]" : "bg-[var(--color-border)]"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
