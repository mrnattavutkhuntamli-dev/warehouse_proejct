import { useFieldArray, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormRow,
  FormSection,
  FormActions,
} from "@/components/common/FormField";
import { useCreatePO } from "@/services/procurementService";
import { useSuppliers } from "@/services/suppliersService";
import { useMaterials } from "@/services/materialsService";
import { formatCurrency } from "@/utils/formatters";

const itemSchema = z.object({
  materialId: z.string().uuid("กรุณาเลือกวัสดุ"),
  quantity: z.coerce.number().min(0.01, "ต้องมากกว่า 0"),
  unitPrice: z.coerce.number().min(0, "ราคาต้องไม่ติดลบ"),
});

const schema = z.object({
  supplierId: z.string().uuid("กรุณาเลือกผู้จำหน่าย"),
  note: z.string().optional(),
  items: z.array(itemSchema).min(1, "ต้องมีอย่างน้อย 1 รายการ"),
});

export function POForm({ onSuccess, onCancel }) {
  const createMutation = useCreatePO();
  const { data: suppliersData } = useSuppliers({ limit: 200 });
  const { data: materialsData } = useMaterials({
    limit: 200,
    isActive: "true",
  });

  const suppliers = suppliersData ?? [];
  const materials = materialsData ?? [];

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      supplierId: "",
      note: "",
      items: [{ materialId: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");

  const grandTotal = watchedItems?.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
  }, 0);

  const onSubmit = async (data) => {
    await createMutation.mutateAsync(data);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection title="ข้อมูล PO">
        <FormField
          label="ผู้จำหน่าย"
          error={errors.supplierId?.message}
          required
        >
          <Controller
            control={control}
            name="supplierId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className={
                    errors.supplierId ? "border-[var(--color-danger)]" : ""
                  }
                >
                  <SelectValue placeholder="เลือกผู้จำหน่าย..." />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}{" "}
                      <span className="text-[var(--color-text-muted)] ml-1">
                        ({s.code})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField label="หมายเหตุ / เงื่อนไขพิเศษ">
          <Textarea
            placeholder="สั่งด่วน, เงื่อนไขการชำระเงิน, ฯลฯ"
            rows={2}
            {...register("note")}
          />
        </FormField>
      </FormSection>

      {/* Items */}
      <FormSection title="รายการวัสดุ">
        {errors.items?.root && (
          <p className="text-xs text-[var(--color-danger)]">
            {errors.items.root.message}
          </p>
        )}

        <div className="space-y-3">
          {/* Header row */}
          <div className="hidden sm:grid grid-cols-[1fr_100px_120px_36px] gap-2 px-1">
            {["วัสดุ", "จำนวน", "ราคา/หน่วย", ""].map((h) => (
              <p
                key={h}
                className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-muted)]"
              >
                {h}
              </p>
            ))}
          </div>

          {fields.map((field, idx) => {
            const qty = Number(watchedItems?.[idx]?.quantity) || 0;
            const price = Number(watchedItems?.[idx]?.unitPrice) || 0;
            const lineTotal = qty * price;

            return (
              <div key={field.id} className="relative">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px_120px_36px] gap-2 items-start">
                  {/* Material select */}
                  <FormField error={errors.items?.[idx]?.materialId?.message}>
                    <Controller
                      control={control}
                      name={`items.${idx}.materialId`}
                      render={({ field: f }) => (
                        <Select value={f.value} onValueChange={f.onChange}>
                          <SelectTrigger
                            className={
                              errors.items?.[idx]?.materialId
                                ? "border-[var(--color-danger)]"
                                : ""
                            }
                          >
                            <SelectValue placeholder="เลือกวัสดุ..." />
                          </SelectTrigger>
                          <SelectContent>
                            {materials.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                <span className="font-mono text-[var(--color-brand)] mr-2">
                                  {m.code}
                                </span>
                                {m.name}
                                <span className="text-[var(--color-text-muted)] ml-1 text-xs">
                                  ({m.unit})
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>

                  {/* Quantity */}
                  <FormField error={errors.items?.[idx]?.quantity?.message}>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="จำนวน"
                      error={errors.items?.[idx]?.quantity}
                      {...register(`items.${idx}.quantity`)}
                    />
                  </FormField>

                  {/* Unit price */}
                  <FormField error={errors.items?.[idx]?.unitPrice?.message}>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="ราคา/หน่วย"
                      prefix={<span className="text-xs">฿</span>}
                      error={errors.items?.[idx]?.unitPrice}
                      {...register(`items.${idx}.unitPrice`)}
                    />
                  </FormField>

                  {/* Remove */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => remove(idx)}
                    disabled={fields.length === 1}
                    className="hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] mt-0 sm:mt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Line total */}
                {lineTotal > 0 && (
                  <p className="text-right text-xs font-mono text-[var(--color-text-muted)] mt-0.5 pr-9">
                    = {formatCurrency(lineTotal)}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ materialId: "", quantity: 1, unitPrice: 0 })}
          className="w-full border-dashed"
        >
          <Plus className="w-3.5 h-3.5" />
          เพิ่มรายการวัสดุ
        </Button>
      </FormSection>

      {/* Grand total */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border-strong)]">
        <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
          <ShoppingCart className="w-4 h-4" />
          <span className="text-sm">มูลค่ารวมทั้งสิ้น</span>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold font-mono tabular-nums text-[var(--color-brand)]">
            {formatCurrency(grandTotal)}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] font-mono">
            {fields.length} รายการ
          </p>
        </div>
      </div>

      <FormActions
        onCancel={onCancel}
        loading={createMutation.isPending}
        submitLabel="สร้าง PO"
      />
    </form>
  );
}
