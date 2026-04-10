import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { FormField, FormRow, FormSection, FormActions } from "@/components/common/FormField";
import { useCreateUser, useUpdateUser, useDepartments } from "@/services/usersService";

const ROLES = [
  { value: "ADMIN",   label: "Admin — สิทธิ์สูงสุด" },
  { value: "MANAGER", label: "Manager — อนุมัติได้" },
  { value: "STAFF",   label: "Staff — ใช้งานทั่วไป" },
  { value: "VIEWER",  label: "Viewer — ดูได้อย่างเดียว" },
];

const createSchema = z.object({
  employeeCode: z.string().min(1, "กรุณากรอกรหัสพนักงาน").max(20),
  name:         z.string().min(1, "กรุณากรอกชื่อ").max(100),
  email:        z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  password:     z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
  role:         z.enum(["ADMIN","MANAGER","STAFF","VIEWER"]),
  departmentId: z.string().uuid().optional().or(z.literal("")),
  phone:        z.string().optional(),
});

const editSchema = createSchema
  .omit({ password: true })
  .extend({ password: z.string().min(8).optional().or(z.literal("")) });

export function UserForm({ defaultValues, onSuccess, onCancel }) {
  const isEdit = Boolean(defaultValues?.id);
  const { data: deptData } = useDepartments();
  const depts = deptData.data ?? [];

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser(defaultValues?.id);
  const mutation = isEdit ? updateMutation : createMutation;

  // ✅ แยก resolvedDefaults ออกมาก่อน เพื่อหลีกเลี่ยง duplicate key
  const resolvedDefaults = {
    employeeCode: "", name: "", email: "",
    password: "", role: "STAFF",
    departmentId: "", phone: "",
    ...defaultValues,
    departmentId: defaultValues?.departmentId ?? defaultValues?.department?.id ?? "",
  };

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: resolvedDefaults,
  });

  useEffect(() => {
    if (defaultValues) reset({
      ...defaultValues,
      password: "",
      departmentId: defaultValues.departmentId ?? defaultValues.department?.id ?? "",
    });
  }, [defaultValues, reset]);

  const onSubmit = async (data) => {
    const payload = { ...data };
    if (isEdit && !payload.password) delete payload.password;
    if (!payload.departmentId) delete payload.departmentId;
    if (!payload.phone) delete payload.phone;
    await mutation.mutateAsync(payload);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormSection title="ข้อมูลพนักงาน">
        <FormRow>
          <FormField label="รหัสพนักงาน" error={errors.employeeCode?.message} required>
            <Input placeholder="EMP-001" error={errors.employeeCode}
              {...register("employeeCode")} disabled={isEdit} />
          </FormField>
          <FormField label="แผนก">
            <Controller control={control} name="departmentId" render={({ field }) => (
              <Select
                // ✅ แปลง "" → "NONE" สำหรับ Radix UI, แปลงกลับใน onValueChange
                value={field.value || "NONE"}
                onValueChange={(v) => field.onChange(v === "NONE" ? "" : v)}
              >
                <SelectTrigger><SelectValue placeholder="เลือกแผนก..." /></SelectTrigger>
                <SelectContent>
                  {/* ✅ ใช้ value="NONE" แทน value="" */}
                  <SelectItem value="NONE">ไม่ระบุ</SelectItem>
                  {depts
                    .filter((d) => Boolean(d.id))
                    .map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)
                  }
                </SelectContent>
              </Select>
            )} />
          </FormField>
        </FormRow>
        <FormField label="ชื่อ-นามสกุล" error={errors.name?.message} required>
          <Input placeholder="สมชาย ดีงาม" error={errors.name} {...register("name")} />
        </FormField>
        <FormField label="เบอร์โทร">
          <Input placeholder="081-000-0000" {...register("phone")} />
        </FormField>
      </FormSection>

      <FormSection title="บัญชีผู้ใช้">
        <FormField label="อีเมล" error={errors.email?.message} required>
          <Input type="email" placeholder="somchai@example.com" error={errors.email}
            {...register("email")} />
        </FormField>
        <FormRow>
          <FormField
            label={isEdit ? "รหัสผ่านใหม่ (เว้นว่างหากไม่เปลี่ยน)" : "รหัสผ่าน"}
            error={errors.password?.message}
            required={!isEdit}
          >
            <Input type="password" placeholder="อย่างน้อย 8 ตัวอักษร"
              error={errors.password} {...register("password")} />
          </FormField>
          <FormField label="สิทธิ์การใช้งาน" error={errors.role?.message} required>
            <Controller control={control} name="role" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={errors.role ? "border-[var(--color-danger)]" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </FormField>
        </FormRow>
      </FormSection>

      <FormActions onCancel={onCancel} loading={mutation.isPending}
        submitLabel={isEdit ? "บันทึกการแก้ไข" : "สร้างบัญชี"} />
    </form>
  );
}