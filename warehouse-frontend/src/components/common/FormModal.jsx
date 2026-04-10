import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";

/**
 * FormModal — Radix Dialog wrapper สำหรับ CRUD forms
 *
 * Usage:
 *   <FormModal open={open} onOpenChange={setOpen} title="เพิ่มวัสดุ" size="md">
 *     <MaterialForm onSuccess={() => setOpen(false)} />
 *   </FormModal>
 */
export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "md", // "sm" | "md" | "lg" | "xl"
  showClose = true,
}) {
  const sizeClass = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[size] ?? "max-w-lg";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content className={cn(
          "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          "w-full", sizeClass,
          "max-h-[90dvh] overflow-y-auto",
          "rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]",
          "shadow-[0_25px_60px_-15px_rgb(0_0_0_/_0.9)]",
          "data-[state=open]:animate-fade-in"
        )}>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-surface)] z-10">
            <div>
              <Dialog.Title className="text-sm font-bold text-[var(--color-text-primary)] font-[var(--font-display)]">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {description}
                </Dialog.Description>
              )}
            </div>
            {showClose && (
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon-sm" className="shrink-0 -mt-0.5">
                  <X className="w-4 h-4" />
                </Button>
              </Dialog.Close>
            )}
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
