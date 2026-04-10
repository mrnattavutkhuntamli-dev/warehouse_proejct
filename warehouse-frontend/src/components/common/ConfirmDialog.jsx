import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * ConfirmDialog — generic confirmation modal
 *
 * Usage:
 *   <ConfirmDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     title="ลบรายการ?"
 *     description="การดำเนินการนี้ไม่สามารถย้อนกลับได้"
 *     onConfirm={handleDelete}
 *     loading={isDeleting}
 *     variant="destructive"
 *   />
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title = "ยืนยันการดำเนินการ?",
  description,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  onConfirm,
  loading = false,
  variant = "destructive", // "destructive" | "default"
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <AlertDialog.Content className={cn(
          "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          "w-full max-w-sm",
          "rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]",
          "p-6 shadow-[0_25px_50px_-12px_rgb(0_0_0_/_0.8)]",
          "data-[state=open]:animate-fade-in"
        )}>
          <div className="flex items-start gap-4">
            <div className={cn(
              "mt-0.5 p-2 rounded-lg shrink-0",
              variant === "destructive"
                ? "bg-[var(--color-danger-subtle)] text-[var(--color-danger)]"
                : "bg-[var(--color-brand-subtle)] text-[var(--color-brand)]"
            )}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <AlertDialog.Title className="text-sm font-semibold text-[var(--color-text-primary)] leading-snug">
                {title}
              </AlertDialog.Title>
              {description && (
                <AlertDialog.Description className="mt-1.5 text-xs text-[var(--color-text-muted)] leading-relaxed">
                  {description}
                </AlertDialog.Description>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <AlertDialog.Cancel asChild>
              <Button variant="ghost" size="sm" disabled={loading}>
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                variant={variant === "destructive" ? "destructive" : "default"}
                size="sm"
                loading={loading}
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
