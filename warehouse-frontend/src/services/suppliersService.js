import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance";
import { endpoints } from "@/api/endpoints";
import { queryKeys } from "./queryKeys";

export const suppliersApi = {
  list:   (params)     => axiosInstance.get(endpoints.suppliers.list, { params }),
  byId:   (id)         => axiosInstance.get(endpoints.suppliers.byId(id)),
  create: (data)       => axiosInstance.post(endpoints.suppliers.create, data),
  update: (id, data)   => axiosInstance.put(endpoints.suppliers.update(id), data),
  remove: (id)         => axiosInstance.delete(endpoints.suppliers.remove(id)),
};

export function useSuppliers(params = {}) {
  return useQuery({
    queryKey: queryKeys.suppliers.list(params),
    queryFn:  () => suppliersApi.list(params),
    select:   (d) => d.data,
    staleTime: 5 * 60_000,
  });
}

export function useSupplier(id) {
  return useQuery({
    queryKey: queryKeys.suppliers.detail(id),
    queryFn:  () => suppliersApi.byId(id),
    select:   (d) => d.data,
    enabled:  Boolean(id),
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: suppliersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.suppliers.all });
      toast.success("เพิ่มผู้จำหน่ายสำเร็จ");
    },
  });
}

export function useUpdateSupplier(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => suppliersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.suppliers.all });
      qc.invalidateQueries({ queryKey: queryKeys.suppliers.detail(id) });
      toast.success("แก้ไขผู้จำหน่ายสำเร็จ");
    },
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => suppliersApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.suppliers.all });
      toast.success("ปิดใช้งานผู้จำหน่ายแล้ว");
    },
  });
}
