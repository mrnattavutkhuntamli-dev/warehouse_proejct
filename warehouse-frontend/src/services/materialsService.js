import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance";
import { endpoints } from "@/api/endpoints";
import { queryKeys } from "./queryKeys";

// ─── Raw API Functions ────────────────────────────────────────────────────────

export const materialsApi = {
  list:           (params) => axiosInstance.get(endpoints.materials.list, { params }),
  byId:           (id)     => axiosInstance.get(endpoints.materials.byId(id)),
  create:         (data)   => axiosInstance.post(endpoints.materials.create, data),
  update:         (id, data) => axiosInstance.put(endpoints.materials.update(id), data),
  remove:         (id)     => axiosInstance.delete(endpoints.materials.remove(id)),
  lowStock:       (params) => axiosInstance.get(endpoints.materials.lowStock, { params }),
  categories: {
    list:   (params) => axiosInstance.get(endpoints.materials.categories.list, { params }),
    create: (data)   => axiosInstance.post(endpoints.materials.categories.create, data),
    update: (id, data) => axiosInstance.put(endpoints.materials.categories.update(id), data),
    remove: (id)     => axiosInstance.delete(endpoints.materials.categories.remove(id)),
  },
};

// ─── TanStack Query Hooks ─────────────────────────────────────────────────────

/** List materials with pagination + filters */
export function useMaterials(params = {}) {
  return useQuery({
    queryKey: queryKeys.materials.list(params),
    queryFn:  () => materialsApi.list(params),
    select:   (data) => data.data,
    staleTime: 30_000, // 30s — stock มีการเปลี่ยนแปลงบ่อย
  });
}

/** Material detail */
export function useMaterial(id) {
  return useQuery({
    queryKey: queryKeys.materials.detail(id),
    queryFn:  () => materialsApi.byId(id),
    select:   (data) => data.data,
    enabled:  Boolean(id),
  });
}

/** Low stock alert list */
export function useLowStock(params = {}) {
  return useQuery({
    queryKey: queryKeys.materials.lowStock,
    queryFn:  () => materialsApi.lowStock(params),
    select:   (data) => data.data,
    staleTime: 60_000,
    refetchInterval: 5 * 60_000, // Auto-refresh ทุก 5 นาที
  });
}

/** Categories list */
export function useMaterialCategories(params = {}) {
  return useQuery({
    queryKey: queryKeys.materials.categories.list(params),
    queryFn:  () => materialsApi.categories.list(params),
    select:   (data) => data.data,
    staleTime: 5 * 60_000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: materialsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.materials.all });
      toast.success("เพิ่มวัสดุสำเร็จ");
    },
  });
}

export function useUpdateMaterial(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => materialsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.materials.all });
      qc.invalidateQueries({ queryKey: queryKeys.materials.detail(id) });
      toast.success("แก้ไขวัสดุสำเร็จ");
    },
  });
}

export function useDeleteMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => materialsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.materials.all });
      toast.success("ปิดใช้งานวัสดุแล้ว");
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: materialsApi.categories.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.materials.categories.all });
      toast.success("เพิ่มหมวดหมู่สำเร็จ");
    },
  });
}
