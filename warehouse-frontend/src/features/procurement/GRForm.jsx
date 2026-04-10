import { useEffect } from "react";
import { useFieldArray, useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Truck, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormField, FormRow, FormSection, FormActions } from "@/components/common/FormField";
import { useCreateGR, usePurchaseOrders, usePurchaseOrder } from "@/services/procurementService";
import { useSuppliers } from "@/services/suppliersService";
import { useLocations } from "@/services/warehousesService";
import { formatCurrency, formatNumber } from "@/utils/formatters";

const itemSchema = z.object({
  materialId: z.string().uuid("กรุณาเลือกวัสดุ"),
  quantity:   z.coerce.number().min(0.01, "ต้องมากกว่า 0"),
  unitPrice:  z.coerce.number().min(0),
  locationId: z.string().uuid("กรุณาเลือก Location").optional().or(z.literal("")),
});

const schema = z.object({
  supplierId:      z.string().uuid("กรุณาเลือกผู้จำหน่าย"),
  purchaseOrderId: z.string().uuid().optional().or(z.literal("")),
  note:            z.string().optional(),
  items:           z.array(itemSchema).min(1, "ต้องมีอย่างน้อย 1 รายการ"),
});

/**
 * GRForm — บันทึกรับสินค้า
 * @param {string|null} defaultPoId — ถ้ามาจาก PODetailPage จะ pre-fill PO
 */
export function GRForm({ defaultPoId, onSuccess, onCancel }) {
  const createGR = useCreateGR();

  const { data: suppliersData } = useSuppliers({ limit: 200 });
  const { data: locationsData  } = useLocations({ limit: 200 });
  const { data: poListData     } = usePurchaseOrders({ status: "APPROVED,PARTIAL_RECEIVED", limit: 200 });

  const suppliers = suppliersData?.data ?? [];
  const locations = locationsData?.data ?? [];
  const approvedPOs = poListData?.data ?? [];

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      supplierId:      "",
      purchaseOrderId: defaultPoId ?? "",
      note:            "",
      items:           [{ materialId: "", quantity: 1, unitPrice: 0, locationId: "" }],
    },
  });

  const selectedPoId = watch("purchaseOrderId");
  const watchedItems = watch("items");

  // ดึงข้อมูล PO ที่เลือก เพื่อ pre-fill items
  const { data: selectedPO } = usePurchaseOrder(selectedPoId || null);

  // Auto-fill items จาก PO ที่เลือก
  useEffect(() => {
    if (!selectedPO) return;
    // set supplier จาก PO
    if (selectedPO.supplierId) setValue("supplierId", selectedPO.supplierId);
    // pre-fill items ที่ยังรับไม่ครบ
    const remaining = selectedPO.items
      ?.filter(i => (i.quantity - (i.receivedQty ?? 0)) > 0)
      .map(i => ({
        materialId: i.materialId,
        quantity:   Number((i.quantity - (i.receivedQty ?? 0)).toFixed(4)),
        unitPrice:  Number(i.unitPrice),
        locationId: "",
      }));
    if (remaining?.length > 0) {
      setValue("items", remaining);
    }
  }, [selectedPO, setValue]);

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const grandTotal = watchedItems?.reduce((s, i) =>
    s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      purchaseOrderId: data.purchaseOrderId || undefined,
      items: data.items.map(i => ({
        ...i,
        locationId: i.locationId || undefined,
      })),
    };
    await createGR.mutateAsync(payload);
    onSuccess?.();
  };

  // สร้าง materialId→name map จาก PO ที่เลือก
  const poMaterialMap = Object.fromEntries(
    (selectedPO?.items ?? []).map(i => [i.materialId, i.material])
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* แจ้งเตือนว่าสต็อกจะอัปเดตทันที */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-info-subtle)] border border-[var(--color-info)]/30">
        <AlertCircle className="w-4 h-4 text-[var(--color-info)] shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--color-info)]">
          เมื่อบันทึก GR สต็อกวัสดุจะถูกเพิ่มทันที และสถานะ PO จะอัปเดตอัตโนมัติ
        </p>
      </div>

      <FormSection title="ข้อมูลการรับ">
        <FormRow>
          {/* อ้างอิง PO */}
          <FormField label="อ้างอิง PO (ถ้ามี)">
            <Controller control={control} name="purchaseOrderId" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="ไม่อ้างอิง PO..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ไม่อ้างอิง PO</SelectItem>
                  {approvedPOs.map(po => (
                    <SelectItem key={po.id} value={po.id}>
                      <span className="font-mono text-[var(--color-brand)] mr-2">{po.poNumber}</span>
                      {po.supplier?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
          </FormField>

          {/* ผู้จำหน่าย */}
          <FormField label="ผู้จำหน่าย" error={errors.supplierId?.message} required>
            <Controller control={control} name="supplierId" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={errors.supplierId ? "border-[var(--color-danger)]" : ""}>
                  <SelectValue placeholder="เลือกผู้จำหน่าย..." />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
          </FormField>
        </FormRow>

        <FormField label="หมายเหตุ">
          <Textarea placeholder="หมายเหตุเพิ่มเติม..." rows={2} {...register("note")} />
        </FormField>
      </FormSection>

      {/* Items */}
      <FormSection title="รายการวัสดุที่รับ">
        {errors.items?.root && (
          <p className="text-xs text-[var(--color-danger)]">{errors.items.root.message}</p>
        )}

        <div className="space-y-3">
          <div className="hidden sm:grid grid-cols-[1fr_90px_110px_150px_36px] gap-2 px-1">
            {["วัสดุ", "จำนวน", "ราคา/หน่วย", "เก็บที่ Location", ""].map(h => (
              <p key={h} className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-muted)]">{h}</p>
            ))}
          </div>

          {fields.map((field, idx) => {
            const qty = Number(watchedItems?.[idx]?.quantity) || 0;
            const price = Number(watchedItems?.[idx]?.unitPrice) || 0;
            const mat = poMaterialMap[watchedItems?.[idx]?.materialId];

            return (
              <div key={field.id}>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_90px_110px_150px_36px] gap-2 items-start">
                  {/* Material — ถ้ามาจาก PO แสดงชื่อ, ถ้าไม่มีแสดง input */}
                  <FormField error={errors.items?.[idx]?.materialId?.message}>
                    {selectedPO ? (
                      <div className="h-9 flex items-center px-3 rounded-md bg-[var(--color-surface-3)] border border-[var(--color-border)] gap-2">
                        <span className="text-xs font-mono text-[var(--color-brand)]">{mat?.code}</span>
                        <span className="text-sm text-[var(--color-text-primary)] truncate">{mat?.name ?? watchedItems?.[idx]?.materialId}</span>
                      </div>
                    ) : (
                      <Input
                        placeholder="Material ID (UUID)"
                        error={errors.items?.[idx]?.materialId}
                        {...register(`items.${idx}.materialId`)}
                      />
                    )}
                  </FormField>

                  {/* Quantity */}
                  <FormField error={errors.items?.[idx]?.quantity?.message}>
                    <Input type="number" step="0.01" min="0.01" placeholder="จำนวน"
                      error={errors.items?.[idx]?.quantity}
                      {...register(`items.${idx}.quantity`)} />
                  </FormField>

                  {/* Unit price */}
                  <FormField error={errors.items?.[idx]?.unitPrice?.message}>
                    <Input type="number" step="0.01" min="0" placeholder="ราคา"
                      prefix={<span className="text-xs">฿</span>}
                      {...register(`items.${idx}.unitPrice`)} />
                  </FormField>

                  {/* Location */}
                  <FormField error={errors.items?.[idx]?.locationId?.message}>
                    <Controller control={control} name={`items.${idx}.locationId`} render={({ field: f }) => (
                      <Select value={f.value} onValueChange={f.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือก Location..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">ไม่ระบุ</SelectItem>
                          {locations.map(loc => (
                            <SelectItem key={loc.id} value={loc.id}>
                              <span className="font-mono text-xs text-[var(--color-brand)] mr-1">{loc.code}</span>
                              {loc.warehouse?.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )} />
                  </FormField>

                  {/* Remove */}
                  <Button type="button" variant="ghost" size="icon-sm"
                    onClick={() => remove(idx)} disabled={fields.length === 1}
                    className="hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] mt-0 sm:mt-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {qty > 0 && price > 0 && (
                  <p className="text-right text-xs font-mono text-[var(--color-text-muted)] mt-0.5 pr-9">
                    = {formatCurrency(qty * price)}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {!selectedPO && (
          <Button type="button" variant="outline" size="sm"
            onClick={() => append({ materialId: "", quantity: 1, unitPrice: 0, locationId: "" })}
            className="w-full border-dashed">
            <Plus className="w-3.5 h-3.5" />เพิ่มรายการ
          </Button>
        )}
      </FormSection>

      {/* Grand total */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border-strong)]">
        <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
          <Truck className="w-4 h-4" />
          <span className="text-sm">มูลค่ารับสินค้าทั้งสิ้น</span>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold font-mono tabular-nums text-[var(--color-success)]">
            {formatCurrency(grandTotal)}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] font-mono">{fields.length} รายการ</p>
        </div>
      </div>

      <FormActions onCancel={onCancel} loading={createGR.isPending} submitLabel="บันทึกรับสินค้า" />
    </form>
  );
}
