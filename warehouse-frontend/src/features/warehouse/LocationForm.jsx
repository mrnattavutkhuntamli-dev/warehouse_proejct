import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { FormField, FormRow, FormActions } from "@/components/common/FormField";
import { useCreateLocation, useUpdateLocation, useWarehouses } from "@/services/warehousesService";

const schema = z.object({
  code:        z.string().min(1, "กรุณากรอกรหัส Location").max(30),
  name:        z.string().min(1, "กรุณากรอกชื่อ Location").max(100),
  warehouseId: z.string().uuid("กรุณาเลือกคลัง"),
  description: z.string().optional(),
});

export function LocationForm({ defaultValues, onSuccess, onCancel }) {
  const isEdit = Boolean(defaultValues?.id);
  const { data: whData } = useWarehouses({ limit: 100 });
  const warehouses = whData ?? [];

  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation(defaultValues?.id);
  const mutation = isEdit ? updateMutation : createMutation;

  // ✅ แยก resolvedDefaults ออกมาก่อน เพื่อหลีกเลี่ยง duplicate key
  const resolvedDefaults = {
    code: "", name: "", warehouseId: "", description: "",
    ...defaultValues,
    warehouseId: defaultValues?.warehouseId ?? defaultValues?.warehouse?.id ?? "",
  };

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: resolvedDefaults,
  });

  useEffect(() => {
    if (defaultValues) reset({
      ...defaultValues,
      warehouseId: defaultValues.warehouseId ?? defaultValues.warehouse?.id ?? "",
    });
  }, [defaultValues, reset]);

  const onSubmit = async (data) => {
    await mutation.mutateAsync(data);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormRow>
        <FormField label="รหัส Location" error={errors.code?.message} required>
          <Input placeholder="A-01-01" error={errors.code} {...register("code")} disabled={isEdit} />
        </FormField>
        <FormField label="ชื่อ" error={errors.name?.message} required>
          <Input placeholder="ชั้น A แถว 1 ช่อง 1" error={errors.name} {...register("name")} />
        </FormField>
      </FormRow>
      <FormField label="คลังสินค้า" error={errors.warehouseId?.message} required>
        <Controller control={control} name="warehouseId" render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className={errors.warehouseId ? "border-[var(--color-danger)]" : ""}>
              <SelectValue placeholder="เลือกคลัง..." />
            </SelectTrigger>
            <SelectContent>
              {warehouses
                .filter((wh) => Boolean(wh.id))
                .map((wh) => (
                  <SelectItem key={wh.id} value={wh.id}>{wh.name} ({wh.code})</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        )} />
      </FormField>
      <FormField label="คำอธิบาย">
        <Input placeholder="รายละเอียดเพิ่มเติม..." {...register("description")} />
      </FormField>
      <FormActions onCancel={onCancel} loading={mutation.isPending}
        submitLabel={isEdit ? "บันทึกการแก้ไข" : "สร้าง Location"} />
    </form>
  );
}