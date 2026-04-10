import { cn } from "@/utils/cn";

/**
 * FormField — wraps label + input + error message
 *
 * Usage:
 *   <FormField label="ชื่อวัสดุ" error={errors.name?.message} required>
 *     <Input {...register("name")} error={errors.name} />
 *   </FormField>
 */
export function FormField({ label, error, required, hint, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="text-xs font-semibold text-[var(--color-text-secondary)] tracking-wide uppercase font-mono">
          {label}
          {required && <span className="text-[var(--color-danger)] ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-[11px] text-[var(--color-text-muted)]">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] text-[var(--color-danger)]">{error}</p>
      )}
    </div>
  );
}

/**
 * FormRow — 2-column grid for side-by-side fields
 */
export function FormRow({ children, className }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", className)}>
      {children}
    </div>
  );
}

/**
 * FormSection — grouping with optional heading
 */
export function FormSection({ title, children, className }) {
  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <div className="flex items-center gap-3">
          <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
            {title}
          </p>
          <div className="flex-1 h-px bg-[var(--color-border)]" />
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * FormActions — footer row with cancel + submit
 */
export function FormActions({ onCancel, submitLabel = "บันทึก", loading = false, children }) {
  return (
    <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border)] mt-2">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="h-9 px-4 rounded-md text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors disabled:opacity-40"
        >
          ยกเลิก
        </button>
      )}
      {children}
      <button
        type="submit"
        disabled={loading}
        className="h-9 px-5 rounded-md text-sm font-semibold bg-[var(--color-brand)] text-[var(--color-text-inverse)] hover:bg-[var(--color-brand-dim)] transition-colors disabled:opacity-40 flex items-center gap-2"
      >
        {loading && (
          <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 100 24v-4l-3 3 3 3v4a12 12 0 000-24z" />
          </svg>
        )}
        {submitLabel}
      </button>
    </div>
  );
}
