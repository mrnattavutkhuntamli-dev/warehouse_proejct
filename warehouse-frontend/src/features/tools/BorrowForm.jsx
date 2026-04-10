import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogIn, LogOut, User, CalendarDays, StickyNote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormRow, FormSection, FormActions } from "@/components/common/FormField";
import { useBorrowTool, useReturnTool } from "@/services/toolsService";
import { formatDate } from "@/utils/formatters";

const borrowSchema = z.object({
  borrowerName:  z.string().min(1, "กรุณากรอกชื่อผู้ยืม"),
  borrowerDept:  z.string().optional(),
  expectedReturn: z.string().min(1, "กรุณาระบุวันที่คาดว่าจะคืน"),
  purpose:       z.string().min(1, "กรุณาระบุวัตถุประสงค์"),
  note:          z.string().optional(),
});

const returnSchema = z.object({
  condition:     z.enum(["GOOD", "FAIR", "POOR"]),
  note:          z.string().optional(),
});

/**
 * BorrowForm — ฟอร์มยืมเครื่องมือ
 */
export function BorrowForm({ toolId, toolName, onSuccess, onCancel }) {
  const borrowMutation = useBorrowTool(toolId);

  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const defaultReturn = nextWeek.toISOString().split("T")[0];

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(borrowSchema),
    defaultValues: {
      borrowerName:   "",
      borrowerDept:   "",
      expectedReturn: defaultReturn,
      purpose:        "",
      note:           "",
    },
  });

  const onSubmit = async (data) => {
    await borrowMutation.mutateAsync(data);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Tool banner */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-warning-subtle)] border border-[var(--color-warning)]/30">
        <LogOut className="w-4 h-4 text-[var(--color-warning)] shrink-0" />
        <p className="text-xs text-[var(--color-warning)]">
          กำลังบันทึกการยืม: <span className="font-semibold">{toolName}</span>
        </p>
      </div>

      <FormSection title="ข้อมูลผู้ยืม">
        <FormRow>
          <FormField label="ชื่อผู้ยืม" error={errors.borrowerName?.message} required>
            <Input
              placeholder="สมชาย ดีงาม"
              prefix={<User className="w-3.5 h-3.5" />}
              error={errors.borrowerName}
              {...register("borrowerName")}
            />
          </FormField>
          <FormField label="แผนก">
            <Input placeholder="ฝ่ายซ่อมบำรุง" {...register("borrowerDept")} />
          </FormField>
        </FormRow>
        <FormField label="วัตถุประสงค์" error={errors.purpose?.message} required>
          <Input
            placeholder="ซ่อมปั๊มน้ำอาคาร A"
            prefix={<StickyNote className="w-3.5 h-3.5" />}
            error={errors.purpose}
            {...register("purpose")}
          />
        </FormField>
      </FormSection>

      <FormSection title="กำหนดคืน">
        <FormRow>
          <FormField label="วันที่คาดว่าจะคืน" error={errors.expectedReturn?.message} required>
            <Input
              type="date"
              prefix={<CalendarDays className="w-3.5 h-3.5" />}
              error={errors.expectedReturn}
              {...register("expectedReturn")}
            />
          </FormField>
        </FormRow>
        <FormField label="หมายเหตุ">
          <Textarea placeholder="รายละเอียดเพิ่มเติม..." rows={2} {...register("note")} />
        </FormField>
      </FormSection>

      <FormActions
        onCancel={onCancel}
        loading={borrowMutation.isPending}
        submitLabel="ยืนยันการยืม"
      />
    </form>
  );
}

/**
 * ReturnForm — ฟอร์มคืนเครื่องมือ
 */
export function ReturnForm({ record, onSuccess, onCancel }) {
  const returnMutation = useReturnTool();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      condition: "GOOD",
      note: "",
    },
  });

  const condition = watch("condition");

  const conditionConfig = {
    GOOD: { label: "สภาพดี", color: "text-[var(--color-success)]", border: "border-[var(--color-success)]" },
    FAIR: { label: "พอใช้",  color: "text-[var(--color-warning)]", border: "border-[var(--color-warning)]" },
    POOR: { label: "สภาพแย่",color: "text-[var(--color-danger)]",  border: "border-[var(--color-danger)]"  },
  };

  const onSubmit = async (data) => {
    await returnMutation.mutateAsync({ recordId: record.id, ...data });
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Summary */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-success-subtle)] border border-[var(--color-success)]/30">
        <LogIn className="w-4 h-4 text-[var(--color-success)] shrink-0" />
        <div className="text-xs text-[var(--color-success)]">
          <p className="font-semibold">{record?.tool?.name}</p>
          <p className="opacity-80">ยืมโดย {record?.borrowerName} เมื่อ {formatDate(record?.borrowedAt)}</p>
        </div>
      </div>

      <FormSection title="สภาพเครื่องมือเมื่อคืน">
        {/* Condition toggle */}
        <div className="grid grid-cols-3 gap-2">
          {["GOOD", "FAIR", "POOR"].map((val) => {
            const cfg = conditionConfig[val];
            const isSelected = condition === val;
            return (
              <label key={val} className={`
                relative flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 cursor-pointer transition-all
                ${isSelected ? `${cfg.border} bg-[var(--color-surface-2)]` : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"}
              `}>
                <input
                  type="radio"
                  value={val}
                  className="sr-only"
                  {...register("condition")}
                />
                <span className={`text-sm font-semibold ${isSelected ? cfg.color : "text-[var(--color-text-muted)]"}`}>
                  {cfg.label}
                </span>
              </label>
            );
          })}
        </div>

        <FormField label="หมายเหตุ (ถ้ามีความเสียหาย)">
          <Textarea
            placeholder="รอยขีดข่วนที่ด้ามจับ, ต้องส่งซ่อม..."
            rows={2}
            {...register("note")}
          />
        </FormField>
      </FormSection>

      <FormActions
        onCancel={onCancel}
        loading={returnMutation.isPending}
        submitLabel="ยืนยันการคืน"
      />
    </form>
  );
}
