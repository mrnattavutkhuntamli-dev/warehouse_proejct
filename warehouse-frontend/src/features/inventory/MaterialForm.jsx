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
  useCreateMaterial,
  useUpdateMaterial,
  useMaterialCategories,
} from "@/services";

const schema = z.object({
  code: z.string().min(1, "กรุณากรอกรหัสวัสดุ").max(20),
  name: z.string().min(1, "กรุณากรอกชื่อวัสดุ").max(200),
  description: z.string().optional(),
  unit: z.string().min(1, "กรุณาระบุหน่วย"),
  categoryId: z.string().uuid("กรุณาเลือกหมวดหมู่"),
  minStock: z.coerce.number().min(0, "ต้องมากกว่าหรือเท่ากับ 0"),
  maxStock: z.coerce.number().min(0).optional().nullable(),
  location: z.string().optional(),
});

/**
 * MaterialForm — ใช้สำหรับทั้ง Create และ Edit
 * @param {object|null} defaultValues  — ถ้ามีค่า = Edit mode
 * @param {function}    onSuccess
 * @param {function}    onCancel
 */
export function MaterialForm({ defaultValues, onSuccess, onCancel }) {
  const isEdit = Boolean(defaultValues?.id);
  const { data: categoriesData } = useMaterialCategories();
  const categories = categoriesData ?? [];

  const createMutation = useCreateMaterial();
  const updateMutation = useUpdateMaterial(defaultValues?.id);
  const mutation = isEdit ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      unit: "",
      categoryId:
        defaultValues?.categoryId ?? defaultValues?.category?.id ?? "", // ✅ คำนวณตรงนี้เลย
      minStock: 0,
      maxStock: null,
      location: "",
      ...defaultValues, // spread ทับค่า default ที่กำหนดไว้
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        categoryId:
          defaultValues.categoryId ?? defaultValues.category?.id ?? "",
      });
    }
  }, [defaultValues, reset]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      maxStock: data.maxStock || null,
    };
    await mutation.mutateAsync(isEdit ? payload : payload);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormSection title="ข้อมูลพื้นฐาน">
        <FormRow>
          <FormField label="รหัสวัสดุ" error={errors.code?.message} required>
            <Input
              placeholder="MTL001"
              error={errors.code}
              {...register("code")}
              disabled={isEdit}
            />
          </FormField>
          <FormField label="หน่วย" error={errors.unit?.message} required>
            <Input
              placeholder="ลิตร, ชิ้น, กก., ม้วน"
              error={errors.unit}
              {...register("unit")}
            />
          </FormField>
        </FormRow>

        <FormField label="ชื่อวัสดุ" error={errors.name?.message} required>
          <Input
            placeholder="น้ำมันเกียร์ ISO 68"
            error={errors.name}
            {...register("name")}
          />
        </FormField>

        <FormField label="หมวดหมู่" error={errors.categoryId?.message} required>
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
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField label="คำอธิบาย" error={errors.description?.message}>
          <Textarea
            placeholder="รายละเอียดเพิ่มเติม..."
            rows={3}
            {...register("description")}
          />
        </FormField>
      </FormSection>

      <FormSection title="สต็อก">
        <FormRow>
          <FormField
            label="สต็อกต่ำสุด (แจ้งเตือน)"
            error={errors.minStock?.message}
            required
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              error={errors.minStock}
              {...register("minStock")}
            />
          </FormField>
          <FormField
            label="สต็อกสูงสุด"
            error={errors.maxStock?.message}
            hint="เว้นว่างหากไม่ต้องการกำหนด"
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="ไม่จำกัด"
              {...register("maxStock")}
            />
          </FormField>
        </FormRow>
      </FormSection>

      <FormActions
        onCancel={onCancel}
        loading={mutation.isPending}
        submitLabel={isEdit ? "บันทึกการแก้ไข" : "เพิ่มวัสดุ"}
      />
    </form>
  );
}
