import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormRow, FormActions } from "@/components/common/FormField";
import { useCreateDepartment, useUpdateDepartment } from "@/services/usersService";

const schema = z.object({
  code:        z.string().min(1, "กรุณากรอกรหัสแผนก").max(10),
  name:        z.string().min(1, "กรุณากรอกชื่อแผนก").max(100),
  description: z.string().optional(),
});

export function DepartmentForm({ defaultValues, onSuccess, onCancel }) {
  const isEdit = Boolean(defaultValues?.id);
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment(defaultValues?.id);
  const mutation = isEdit ? updateMutation : createMutation;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { code: "", name: "", description: "", ...defaultValues },
  });

  useEffect(() => { if (defaultValues) reset(defaultValues); }, [defaultValues, reset]);

  const onSubmit = async (data) => {
    await mutation.mutateAsync(data);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormRow>
        <FormField label="รหัสแผนก" error={errors.code?.message} required>
          <Input placeholder="HR, IT, MAINT" error={errors.code}
            {...register("code")} disabled={isEdit} />
        </FormField>
      </FormRow>
      <FormField label="ชื่อแผนก" error={errors.name?.message} required>
        <Input placeholder="ฝ่ายซ่อมบำรุง" error={errors.name} {...register("name")} />
      </FormField>
      <FormField label="คำอธิบาย">
        <Textarea placeholder="หน้าที่รับผิดชอบ..." rows={2} {...register("description")} />
      </FormField>
      <FormActions onCancel={onCancel} loading={mutation.isPending}
        submitLabel={isEdit ? "บันทึก" : "เพิ่มแผนก"} />
    </form>
  );
}
