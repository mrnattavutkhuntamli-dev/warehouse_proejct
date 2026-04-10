import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance";
import { endpoints } from "@/api/endpoints";
import { queryKeys } from "./queryKeys";

// ─── Raw API ──────────────────────────────────────────────────────────────────
export const stockApi = {
  levels:       (params) => axiosInstance.get(endpoints.stock.levels, { params }),
  transactions: (params) => axiosInstance.get(endpoints.stock.transactions, { params }),
  createTx:     (data)   => axiosInstance.post(endpoints.stock.createTx, data),
  counts: {
    list:   (params) => axiosInstance.get(endpoints.stock.counts.list, { params }),
    byId:   (id)     => axiosInstance.get(endpoints.stock.counts.byId(id)),
    create: (data)   => axiosInstance.post(endpoints.stock.counts.create, data),
    update: (id, data) => axiosInstance.put(endpoints.stock.counts.update(id), data),
  },
};

// ─── Query Hooks ──────────────────────────────────────────────────────────────

/** Stock levels per material per location */
export function useStockLevels(params = {}) {
  return useQuery({
    queryKey: queryKeys.stock.levels(params),
    queryFn:  () => stockApi.levels(params),
    select:   (d) => d.data,
    staleTime: 15_000,
    refetchInterval: 60_000, // auto-refresh ทุก 1 นาที
  });
}

/** Stock transaction history */
export function useStockTransactions(params = {}) {
  return useQuery({
    queryKey: queryKeys.stock.transactions(params),
    queryFn:  () => stockApi.transactions(params),
    select:   (d) => d.data,
    staleTime: 30_000,
  });
}

/** Stock count sessions */
export function useStockCounts(params = {}) {
  return useQuery({
    queryKey: queryKeys.stock.counts.list(params),
    queryFn:  () => stockApi.counts.list(params),
    select:   (d) => d.data,
    staleTime: 60_000,
  });
}

export function useStockCount(id) {
  return useQuery({
    queryKey: queryKeys.stock.counts.detail(id),
    queryFn:  () => stockApi.counts.byId(id),
    select:   (d) => d.data,
    enabled:  Boolean(id),
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateStockTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: stockApi.createTx,
    onSuccess: (_, vars) => {
      // Invalidate stock levels + transactions
      qc.invalidateQueries({ queryKey: ["stock"] });
      qc.invalidateQueries({ queryKey: queryKeys.materials.all });
      toast.success("บันทึก Stock Transaction สำเร็จ");
    },
  });
}

export function useCreateStockCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: stockApi.counts.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.stock.counts.all });
      toast.success("สร้าง Stock Count สำเร็จ");
    },
  });
}

export function useUpdateStockCount(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => stockApi.counts.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.stock.counts.all });
      qc.invalidateQueries({ queryKey: queryKeys.stock.counts.detail(id) });
      qc.invalidateQueries({ queryKey: ["stock", "levels"] });
      toast.success("อัปเดต Stock Count สำเร็จ");
    },
  });
}
