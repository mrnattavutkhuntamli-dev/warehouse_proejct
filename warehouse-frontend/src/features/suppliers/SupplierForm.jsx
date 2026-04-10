import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormRow, FormSection, FormActions } from "@/components/common/FormField";
import { useCreateSupplier, useUpdateSupplier } from "@/services/suppliersService";

const schema = z.object({
  code:        z.string().min(1, "กรุณากรอกรหัสผู้จำหน่าย").max(20),
  name:        z.string().min(1, "กรุณากรอกชื่อบริษัท").max(200),
  contactName: z.string().optional(),
  phone:       z.string().optional(),
  email:       z.string().email("รูปแบบ email ไม่ถูกต้อง").optional().or(z.literal("")),
  address:     z.string().optional(),
  taxId:       z.string().optional(),
  note:        z.string().optional(),
});

export function SupplierForm({ defaultValues, onSuccess, onCancel }) {
  const isEdit = Boolean(defaultValues?.id);
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier(defaultValues?.id);
  const mutation = isEdit ? updateMutation : createMutation;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "", name: "", contactName: "",
      phone: "", email: "", address: "", taxId: "", note: "",
      ...defaultValues,
    },
  });

  useEffect(() => { if (defaultValues) reset(defaultValues); }, [defaultValues, reset]);

  const onSubmit = async (data) => {
    // strip empty strings to undefined
    const clean = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === "" ? undefined : v])
    );
    await mutation.mutateAsync(clean);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormSection title="ข้อมูลบริษัท">
        <FormRow>
          <FormField label="รหัสผู้จำหน่าย" error={errors.code?.message} required>
            <Input placeholder="SUP-001" error={errors.code} {...register("code")} disabled={isEdit} />
          </FormField>
          <FormField label="เลขประจำตัวผู้เสียภาษี">
            <Input placeholder="0-0000-00000-00-0" {...register("taxId")} />
          </FormField>
        </FormRow>
        <FormField label="ชื่อบริษัท / ผู้จำหน่าย" error={errors.name?.message} required>
          <Input placeholder="บริษัท สยามอุตสาหกรรม จำกัด" error={errors.name} {...register("name")} />
        </FormField>
        <FormField label="ที่อยู่">
          <Textarea placeholder="ที่อยู่บริษัท..." rows={2} {...register("address")} />
        </FormField>
      </FormSection>

      <FormSection title="ข้อมูลติดต่อ">
        <FormRow>
          <FormField label="ชื่อผู้ติดต่อ">
            <Input placeholder="คุณสมศักดิ์ ใจดี" {...register("contactName")} />
          </FormField>
          <FormField label="เบอร์โทร">
            <Input placeholder="02-000-0000" {...register("phone")} />
          </FormField>
        </FormRow>
        <FormField label="อีเมล" error={errors.email?.message}>
          <Input type="email" placeholder="contact@company.com" error={errors.email} {...register("email")} />
        </FormField>
      </FormSection>

      <FormSection title="หมายเหตุ">
        <FormField>
          <Textarea placeholder="เงื่อนไขพิเศษ, ระยะเวลาชำระเงิน, ฯลฯ" rows={2} {...register("note")} />
        </FormField>
      </FormSection>

      <FormActions
        onCancel={onCancel}
        loading={mutation.isPending}
        submitLabel={isEdit ? "บันทึกการแก้ไข" : "เพิ่มผู้จำหน่าย"}
      />
    </form>
  );
}
