import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormActions } from "@/components/common/FormField";
import { useCreateToolCategory, useUpdateToolCategory } from "@/services/toolsService";

const schema = z.object({
  name:        z.string().min(1, "กรุณากรอกชื่อหมวดหมู่").max(100),
  description: z.string().optional(),
});

export function ToolCategoryForm({ defaultValues, onSuccess, onCancel }) {
  const isEdit = Boolean(defaultValues?.id);
  const createMutation = useCreateToolCategory();
  const updateMutation = useUpdateToolCategory(defaultValues?.id);
  const mutation = isEdit ? updateMutation : createMutation;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", ...defaultValues },
  });

  useEffect(() => { if (defaultValues) reset(defaultValues); }, [defaultValues, reset]);

  const onSubmit = async (data) => {
    await mutation.mutateAsync(data);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="ชื่อหมวดหมู่" error={errors.name?.message} required>
        <Input placeholder="เครื่องมือไฟฟ้า, ประแจ, เครื่องวัด" error={errors.name} {...register("name")} />
      </FormField>
      <FormField label="คำอธิบาย">
        <Textarea placeholder="รายละเอียดหมวดหมู่..." rows={2} {...register("description")} />
      </FormField>
      <FormActions onCancel={onCancel} loading={mutation.isPending}
        submitLabel={isEdit ? "บันทึก" : "เพิ่มหมวดหมู่"} />
    </form>
  );
}
