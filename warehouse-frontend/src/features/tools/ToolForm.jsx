import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField,
  FormRow,
  FormSection,
  FormActions,
} from "@/components/common/FormField";
import {
  useCreateTool,
  useUpdateTool,
  useToolCategories,
} from "@/services/toolsService";

const TOOL_STATUSES = [
  { value: "AVAILABLE", label: "ว่าง" },
  { value: "MAINTENANCE", label: "ซ่อมบำรุง" },
  { value: "BROKEN", label: "ชำรุด" },
  { value: "RETIRED", label: "เลิกใช้" },
];

const CONDITIONS = [
  { value: "GOOD", label: "สภาพดี" },
  { value: "FAIR", label: "พอใช้" },
  { value: "POOR", label: "สภาพแย่" },
];

const schema = z.object({
  code: z.string().min(1, "กรุณากรอกรหัสเครื่องมือ").max(30),
  name: z.string().min(1, "กรุณากรอกชื่อเครื่องมือ").max(200),
  description: z.string().optional(),
  categoryId: z.string().uuid("กรุณาเลือกหมวดหมู่"),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  status: z.enum(["AVAILABLE", "MAINTENANCE", "BROKEN", "RETIRED"]),
  condition: z.enum(["GOOD", "FAIR", "POOR"]).optional(),
  location: z.string().optional(),
});

export function ToolForm({ defaultValues, onSuccess, onCancel }) {
  const isEdit = Boolean(defaultValues?.id);
  const { data: catData } = useToolCategories();
  const categories = catData ?? [];

  const createMutation = useCreateTool();
  const updateMutation = useUpdateTool(defaultValues?.id);
  const mutation = isEdit ? updateMutation : createMutation;

  console.log(defaultValues);

  // ✅ แยก resolvedDefaults ออกมาก่อน เพื่อหลีกเลี่ยง duplicate key
  const resolvedDefaults = {
    code: "",
    name: "",
    description: "",
    categoryId: "",
    brand: "",
    model: "",
    serialNumber: "",
    status: "AVAILABLE",
    condition: "GOOD",
    location: "",
    ...defaultValues,
    location:
      typeof defaultValues?.location === "object"
        ? defaultValues.location.code // ✅ ถ้าเป็น object ให้เอา .code มาแสดง
        : (defaultValues?.location ?? ""),
    categoryId: defaultValues?.categoryId ?? defaultValues?.category?.id ?? "",
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: resolvedDefaults,
  });

  useEffect(() => {
    if (defaultValues)
      reset({
        ...defaultValues,
        location:
          typeof defaultValues?.location === "object"
            ? defaultValues.location.code // ✅ ถ้าเป็น object ให้เอา .code มาแสดง
            : (defaultValues?.location ?? ""),
        categoryId:
          defaultValues.categoryId ?? defaultValues.category?.id ?? "",
      });
  }, [defaultValues, reset]);

  const onSubmit = async (data) => {
    await mutation.mutateAsync(data);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormSection title="ข้อมูลเครื่องมือ">
        <FormRow>
          <FormField
            label="รหัสเครื่องมือ"
            error={errors.code?.message}
            required
          >
            <Input
              placeholder="TOOL-001"
              error={errors.code}
              {...register("code")}
              disabled={isEdit}
            />
          </FormField>
          <FormField
            label="หมวดหมู่"
            error={errors.categoryId?.message}
            required
          >
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={
                      errors.categoryId ? "border-[var(--color-danger)]" : ""
                    }
                  >
                    <SelectValue placeholder="เลือกหมวดหมู่..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c) => Boolean(c.id))
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </FormRow>

        <FormField label="ชื่อเครื่องมือ" error={errors.name?.message} required>
          <Input
            placeholder="ประแจปากตาย 10mm"
            error={errors.name}
            {...register("name")}
          />
        </FormField>

        <FormField label="คำอธิบาย">
          <Textarea
            placeholder="รายละเอียดเพิ่มเติม..."
            rows={2}
            {...register("description")}
          />
        </FormField>
      </FormSection>

      <FormSection title="รายละเอียดอุปกรณ์">
        <FormRow>
          <FormField label="ยี่ห้อ (Brand)">
            <Input
              placeholder="Bosch, Stanley, Makita"
              {...register("brand")}
            />
          </FormField>
          <FormField label="รุ่น (Model)">
            <Input placeholder="GBH 2-26 DRE" {...register("model")} />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Serial Number">
            <Input placeholder="SN-XXXXXXXX" {...register("serialNumber")} />
          </FormField>
          <FormField label="ตำแหน่งจัดเก็บ">
            <Input
              placeholder="ตู้เก็บเครื่องมือ A-02"
              {...register("location")}
            />
          </FormField>
        </FormRow>
      </FormSection>

      <FormSection title="สถานะ">
        <FormRow>
          <FormField
            label="สถานะปัจจุบัน"
            error={errors.status?.message}
            required
          >
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOOL_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField label="สภาพ">
            <Controller
              control={control}
              name="condition"
              render={({ field }) => (
                <Select
                  value={field.value ?? "GOOD"}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสภาพ..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </FormRow>
      </FormSection>

      <FormActions
        onCancel={onCancel}
        loading={mutation.isPending}
        submitLabel={isEdit ? "บันทึกการแก้ไข" : "เพิ่มเครื่องมือ"}
      />
    </form>
  );
}
