import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormRow, FormActions } from "@/components/common/FormField";
import { useCreateWarehouse, useUpdateWarehouse } from "@/services/warehousesService";

const schema = z.object({
  code:    z.string().min(1, "กรุณากรอกรหัสคลัง").max(20),
  name:    z.string().min(1, "กรุณากรอกชื่อคลัง").max(100),
  address: z.string().optional(),
  phone:   z.string().optional(),
});

export function WarehouseForm({ defaultValues, onSuccess, onCancel }) {
  const isEdit = Boolean(defaultValues?.id);
  const createMutation = useCreateWarehouse();
  const updateMutation = useUpdateWarehouse(defaultValues?.id);
  const mutation = isEdit ? updateMutation : createMutation;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { code: "", name: "", address: "", phone: "", ...defaultValues },
  });

  useEffect(() => { if (defaultValues) reset(defaultValues); }, [defaultValues, reset]);

  const onSubmit = async (data) => {
    await mutation.mutateAsync(data);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormRow>
        <FormField label="รหัสคลัง" error={errors.code?.message} required>
          <Input placeholder="WH-01" error={errors.code} {...register("code")} disabled={isEdit} />
        </FormField>
        <FormField label="ชื่อคลัง" error={errors.name?.message} required>
          <Input placeholder="คลังหลัก A" error={errors.name} {...register("name")} />
        </FormField>
      </FormRow>
      <FormField label="ที่อยู่">
        <Textarea placeholder="ที่ตั้งคลังสินค้า..." rows={2} {...register("address")} />
      </FormField>
      <FormField label="เบอร์โทร">
        <Input placeholder="02-000-0000" {...register("phone")} />
      </FormField>
      <FormActions onCancel={onCancel} loading={mutation.isPending}
        submitLabel={isEdit ? "บันทึกการแก้ไข" : "สร้างคลัง"} />
    </form>
  );
}
