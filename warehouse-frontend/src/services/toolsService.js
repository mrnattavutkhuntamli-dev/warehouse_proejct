import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance";
import { endpoints } from "@/api/endpoints";
import { queryKeys } from "./queryKeys";

// ─── Raw API ──────────────────────────────────────────────────────────────────
export const toolsApi = {
  list:          (params)      => axiosInstance.get(endpoints.tools.list, { params }),
  byId:          (id)          => axiosInstance.get(endpoints.tools.byId(id)),
  create:        (data)        => axiosInstance.post(endpoints.tools.create, data),
  update:        (id, data)    => axiosInstance.put(endpoints.tools.update(id), data),
  remove:        (id)          => axiosInstance.delete(endpoints.tools.remove(id)),
  borrow:        (id, data)    => axiosInstance.post(endpoints.tools.borrow(id), data),
  borrowRecords: (params)      => axiosInstance.get(endpoints.tools.borrowRecords, { params }),
  returnTool:    (recordId, data) => axiosInstance.patch(endpoints.tools.returnTool(recordId), data),
  categories: {
    list:   (params)    => axiosInstance.get(endpoints.tools.categories.list, { params }),
    create: (data)      => axiosInstance.post(endpoints.tools.categories.create, data),
    update: (id, data)  => axiosInstance.put(endpoints.tools.categories.update(id), data),
    remove: (id)        => axiosInstance.delete(endpoints.tools.categories.remove(id)),
  },
};

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export function useTools(params = {}) {
  return useQuery({
    queryKey: queryKeys.tools.list(params),
    queryFn:  () => toolsApi.list(params),
    select:   (d) => d.data,
    staleTime: 30_000,
  });
}

export function useTool(id) {
  return useQuery({
    queryKey: queryKeys.tools.detail(id),
    queryFn:  () => toolsApi.byId(id),
    select:   (d) => d.data,
    enabled:  Boolean(id),
  });
}

export function useBorrowRecords(params = {}) {
  return useQuery({
    queryKey: queryKeys.tools.borrowRecords(params),
    queryFn:  () => toolsApi.borrowRecords(params),
    select:   (d) => d.data,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useToolCategories(params = {}) {
  return useQuery({
    queryKey: queryKeys.tools.categories.list(params),
    queryFn:  () => toolsApi.categories.list(params),
    select:   (d) => d.data,
    staleTime: 5 * 60_000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateTool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toolsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tools.all });
      toast.success("เพิ่มเครื่องมือสำเร็จ");
    },
  });
}

export function useUpdateTool(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => toolsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tools.all });
      qc.invalidateQueries({ queryKey: queryKeys.tools.detail(id) });
      toast.success("แก้ไขเครื่องมือสำเร็จ");
    },
  });
}

export function useDeleteTool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => toolsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tools.all });
      toast.success("ปิดใช้งานเครื่องมือแล้ว");
    },
  });
}

export function useBorrowTool(toolId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => toolsApi.borrow(toolId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tools.all });
      qc.invalidateQueries({ queryKey: queryKeys.tools.detail(toolId) });
      qc.invalidateQueries({ queryKey: ["tools", "borrow-records"] });
      toast.success("บันทึกการยืมสำเร็จ");
    },
    onError: (err) => {
      const msg = err.response?.data?.message;
      if (msg) toast.error(msg);
    },
  });
}

export function useReturnTool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, ...data }) => toolsApi.returnTool(recordId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tools.all });
      qc.invalidateQueries({ queryKey: ["tools", "borrow-records"] });
      toast.success("บันทึกการคืนเครื่องมือสำเร็จ");
    },
  });
}

export function useCreateToolCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toolsApi.categories.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tools.categories.all });
      toast.success("เพิ่มหมวดหมู่สำเร็จ");
    },
  });
}

export function useUpdateToolCategory(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => toolsApi.categories.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tools.categories.all });
      toast.success("แก้ไขหมวดหมู่สำเร็จ");
    },
  });
}

export function useDeleteToolCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => toolsApi.categories.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tools.categories.all });
      toast.success("ลบหมวดหมู่แล้ว");
    },
  });
}
