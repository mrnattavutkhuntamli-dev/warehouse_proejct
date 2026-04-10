import { useFieldArray, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormField, FormRow, FormSection, FormActions } from "@/components/common/FormField";
import { useCreateIssue } from "@/services/procurementService";
import { useMaterials, useMaterialCategories } from "@/services/materialsService";
import { useStockLevels } from "@/services/stockService";
import { formatNumber } from "@/utils/formatters";

const itemSchema = z.object({
  materialId: z.string().uuid("กรุณาเลือกวัสดุ"),
  quantity:   z.coerce.number().min(0.01, "ต้องมากกว่า 0"),
  note:       z.string().optional(),
});

const schema = z.object({
  requesterId:   z.string().optional(),
  departmentId:  z.string().optional(),
  purpose:       z.string().min(1, "กรุณาระบุวัตถุประสงค์"),
  items:         z.array(itemSchema).min(1, "ต้องมีอย่างน้อย 1 รายการ"),
});

export function IssueForm({ onSuccess, onCancel }) {
  const createIssue = useCreateIssue();

  const { data: materialsData } = useMaterials({ limit: 500, isActive: "true" });
  const { data: stockData }     = useStockLevels({ limit: 500 });

  const materials = materialsData?.data ?? [];

  // สร้าง map materialId → totalStock
  const stockMap = Object.fromEntries(
    (stockData?.data ?? []).map(s => [
      s.materialId,
      (stockMap?.[s.materialId] ?? 0) + s.quantity,
    ])
  );
  // rebuild ถูกต้อง
  const stockByMaterial = {};
  for (const s of (stockData?.data ?? [])) {
    stockByMaterial[s.materialId] = (stockByMaterial[s.materialId] ?? 0) + s.quantity;
  }

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      requesterId:  "",
      departmentId: "",
      purpose:      "",
      items:        [{ materialId: "", quantity: 1, note: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      requesterId:  data.requesterId  || undefined,
      departmentId: data.departmentId || undefined,
    };
    await createIssue.mutateAsync(payload);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection title="ข้อมูลการเบิก">
        <FormField label="วัตถุประสงค์ / งานที่ใช้" error={errors.purpose?.message} required>
          <Textarea
            placeholder="ซ่อมบำรุงระบบน้ำ, งานก่อสร้าง Zone B, ฯลฯ"
            rows={2}
            {...register("purpose")}
          />
        </FormField>
      </FormSection>

      {/* Items */}
      <FormSection title="รายการวัสดุที่ขอเบิก">
        {errors.items?.root && (
          <p className="text-xs text-[var(--color-danger)]">{errors.items.root.message}</p>
        )}

        <div className="space-y-3">
          <div className="hidden sm:grid grid-cols-[1fr_100px_36px] gap-2 px-1">
            {["วัสดุ", "จำนวน", ""].map(h => (
              <p key={h} className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-muted)]">{h}</p>
            ))}
          </div>

          {fields.map((field, idx) => {
            const matId = watchedItems?.[idx]?.materialId;
            const mat = materials.find(m => m.id === matId);
            const stockQty = stockByMaterial[matId] ?? null;
            const reqQty = Number(watchedItems?.[idx]?.quantity) || 0;
            const insufficient = stockQty !== null && reqQty > stockQty;

            return (
              <div key={field.id} className="space-y-1">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px_36px] gap-2 items-start">
                  {/* Material */}
                  <FormField error={errors.items?.[idx]?.materialId?.message}>
                    <Controller control={control} name={`items.${idx}.materialId`} render={({ field: f }) => (
                      <Select value={f.value} onValueChange={f.onChange}>
                        <SelectTrigger className={errors.items?.[idx]?.materialId ? "border-[var(--color-danger)]" : ""}>
                          <SelectValue placeholder="เลือกวัสดุ..." />
                        </SelectTrigger>
                        <SelectContent>
                          {materials.map(m => (
                            <SelectItem key={m.id} value={m.id}>
                              <span className="font-mono text-xs text-[var(--color-brand)] mr-2">{m.code}</span>
                              {m.name}
                              <span className="text-[var(--color-text-muted)] ml-1 text-xs">({m.unit})</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )} />
                  </FormField>

                  {/* Qty */}
                  <FormField error={errors.items?.[idx]?.quantity?.message}>
                    <Input
                      type="number" step="0.01" min="0.01" placeholder="จำนวน"
                      error={errors.items?.[idx]?.quantity || insufficient}
                      {...register(`items.${idx}.quantity`)}
                    />
                  </FormField>

                  {/* Remove */}
                  <Button type="button" variant="ghost" size="icon-sm"
                    onClick={() => remove(idx)} disabled={fields.length === 1}
                    className="hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] mt-0 sm:mt-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Stock indicator */}
                {mat && stockQty !== null && (
                  <div className={`flex items-center gap-2 text-xs font-mono px-1 ${insufficient ? "text-[var(--color-danger)]" : "text-[var(--color-text-muted)]"}`}>
                    <span>สต็อกปัจจุบัน: {formatNumber(stockQty, 2)} {mat.unit}</span>
                    {insufficient && <span className="font-semibold">⚠ สต็อกไม่พอ</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Button type="button" variant="outline" size="sm"
          onClick={() => append({ materialId: "", quantity: 1, note: "" })}
          className="w-full border-dashed">
          <Plus className="w-3.5 h-3.5" />เพิ่มรายการวัสดุ
        </Button>
      </FormSection>

      {/* Summary */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border-strong)]">
        <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
          <ClipboardList className="w-4 h-4" />
          <span className="text-sm">จำนวนรายการทั้งหมด</span>
        </div>
        <p className="text-xl font-bold font-mono tabular-nums text-[var(--color-info)]">
          {fields.length} รายการ
        </p>
      </div>

      <FormActions onCancel={onCancel} loading={createIssue.isPending} submitLabel="สร้างใบเบิก (DRAFT)" />
    </form>
  );
}
