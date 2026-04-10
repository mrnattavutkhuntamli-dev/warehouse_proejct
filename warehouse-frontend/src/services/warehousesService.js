import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance";
import { endpoints } from "@/api/endpoints";
import { queryKeys } from "./queryKeys";

// ─── Raw API ──────────────────────────────────────────────────────────────────
export const warehousesApi = {
  list:   (params)       => axiosInstance.get(endpoints.warehouses.list, { params }),
  byId:   (id)           => axiosInstance.get(endpoints.warehouses.byId(id)),
  create: (data)         => axiosInstance.post(endpoints.warehouses.create, data),
  update: (id, data)     => axiosInstance.put(endpoints.warehouses.update(id), data),
  remove: (id)           => axiosInstance.delete(endpoints.warehouses.remove(id)),
  locations: {
    list:   (params)     => axiosInstance.get(endpoints.warehouses.locations.list, { params }),
    byId:   (id)         => axiosInstance.get(endpoints.warehouses.locations.byId(id)),
    create: (data)       => axiosInstance.post(endpoints.warehouses.locations.create, data),
    update: (id, data)   => axiosInstance.put(endpoints.warehouses.locations.update(id), data),
    remove: (id)         => axiosInstance.delete(endpoints.warehouses.locations.remove(id)),
  },
};

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export function useWarehouses(params = {}) {
  return useQuery({
    queryKey: queryKeys.warehouses.list(params),
    queryFn:  () => warehousesApi.list(params),
    select:   (d) => d.data,
    staleTime: 5 * 60_000,
  });
}

export function useWarehouse(id) {
  return useQuery({
    queryKey: queryKeys.warehouses.detail(id),
    queryFn:  () => warehousesApi.byId(id),
    select:   (d) => d.data,
    enabled:  Boolean(id),
  });
}

export function useLocations(params = {}) {
  return useQuery({
    queryKey: queryKeys.warehouses.locations.list(params),
    queryFn:  () => warehousesApi.locations.list(params),
    select:   (d) => d.data,
    staleTime: 5 * 60_000,
  });
}

export function useLocation(id) {
  return useQuery({
    queryKey: queryKeys.warehouses.locations.detail(id),
    queryFn:  () => warehousesApi.locations.byId(id),
    select:   (d) => d.data,
    enabled:  Boolean(id),
  });
}

// ─── Mutations: Warehouses ────────────────────────────────────────────────────

export function useCreateWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: warehousesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.warehouses.all });
      toast.success("สร้างคลังสำเร็จ");
    },
  });
}

export function useUpdateWarehouse(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => warehousesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.warehouses.all });
      qc.invalidateQueries({ queryKey: queryKeys.warehouses.detail(id) });
      toast.success("แก้ไขคลังสำเร็จ");
    },
  });
}

export function useDeleteWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => warehousesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.warehouses.all });
      toast.success("ปิดใช้งานคลังแล้ว");
    },
  });
}

// ─── Mutations: Locations ─────────────────────────────────────────────────────

export function useCreateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: warehousesApi.locations.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.warehouses.locations.all });
      qc.invalidateQueries({ queryKey: queryKeys.warehouses.all });
      toast.success("สร้าง Location สำเร็จ");
    },
  });
}

export function useUpdateLocation(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => warehousesApi.locations.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.warehouses.locations.all });
      qc.invalidateQueries({ queryKey: queryKeys.warehouses.locations.detail(id) });
      toast.success("แก้ไข Location สำเร็จ");
    },
  });
}

export function useDeleteLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => warehousesApi.locations.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.warehouses.locations.all });
      toast.success("ปิดใช้งาน Location แล้ว");
    },
  });
}
