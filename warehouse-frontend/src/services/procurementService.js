import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance";
import { endpoints } from "@/api/endpoints";
import { queryKeys } from "./queryKeys";

// ─── Raw API ──────────────────────────────────────────────────────────────────
export const procurementApi = {
  po: {
    list:         (params)     => axiosInstance.get(endpoints.procurement.po.list, { params }),
    byId:         (id)         => axiosInstance.get(endpoints.procurement.po.byId(id)),
    create:       (data)       => axiosInstance.post(endpoints.procurement.po.create, data),
    updateStatus: (id, data)   => axiosInstance.patch(endpoints.procurement.po.updateStatus(id), data),
  },
  gr: {
    list:         (params)     => axiosInstance.get(endpoints.procurement.gr.list, { params }),
    byId:         (id)         => axiosInstance.get(endpoints.procurement.gr.byId(id)),
    create:       (data)       => axiosInstance.post(endpoints.procurement.gr.create, data),
  },
  issue: {
    list:         (params)     => axiosInstance.get(endpoints.procurement.issue.list, { params }),
    byId:         (id)         => axiosInstance.get(endpoints.procurement.issue.byId(id)),
    create:       (data)       => axiosInstance.post(endpoints.procurement.issue.create, data),
    updateStatus: (id, data)   => axiosInstance.patch(endpoints.procurement.issue.updateStatus(id), data),
  },
};

// ─── Purchase Order Hooks ─────────────────────────────────────────────────────

export function usePurchaseOrders(params = {}) {
  return useQuery({
    queryKey: queryKeys.procurement.po.list(params),
    queryFn:  () => procurementApi.po.list(params),
    select:   (d) => {
     console.log(d)
      return {
        data:d.data,
        pagination: d.pagination,
      }
    },
    staleTime: 30_000,
  });
}

export function usePurchaseOrder(id) {
  return useQuery({
    queryKey: queryKeys.procurement.po.detail(id),
    queryFn:  () => procurementApi.po.byId(id),
    select:   (d) => d.data,
    enabled:  Boolean(id),
  });
}

export function useCreatePO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: procurementApi.po.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.procurement.po.all });
      toast.success("สร้างใบสั่งซื้อสำเร็จ");
    },
  });
}

export function useUpdatePOStatus(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => procurementApi.po.updateStatus(id, data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: queryKeys.procurement.po.all });
      qc.invalidateQueries({ queryKey: queryKeys.procurement.po.detail(id) });
      const status = res?.data?.status;
      const labels = { APPROVED: "อนุมัติแล้ว", CANCELLED: "ยกเลิกแล้ว" };
      toast.success(`PO ${labels[status] ?? "อัปเดต"}สำเร็จ`);
    },
    onError: (err) => {
      if (err.response?.status === 409) {
        toast.error("ข้อมูล PO ถูกแก้ไขก่อนหน้า กรุณาโหลดหน้าใหม่", { duration: 6000 });
      }
    },
  });
}

// ─── Goods Receipt Hooks ──────────────────────────────────────────────────────

export function useGoodsReceipts(params = {}) {
  return useQuery({
    queryKey: queryKeys.procurement.gr.list(params),
    queryFn:  () => procurementApi.gr.list(params),
    select:   (d) => {
      return {
        data:d.data,
        pagination: d.pagination,
      }
    },
    staleTime: 30_000,
  });
}

export function useGoodsReceipt(id) {
  return useQuery({
    queryKey: queryKeys.procurement.gr.detail(id),
    queryFn:  () => procurementApi.gr.byId(id),
    select:   (d) => d.data,
    enabled:  Boolean(id),
  });
}

export function useCreateGR() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: procurementApi.gr.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.procurement.gr.all });
      qc.invalidateQueries({ queryKey: queryKeys.procurement.po.all });
      // Stock changed — invalidate stock & materials
      qc.invalidateQueries({ queryKey: ["stock"] });
      qc.invalidateQueries({ queryKey: queryKeys.materials.all });
      toast.success("รับสินค้าเข้าคลังสำเร็จ สต็อกอัปเดตแล้ว");
    },
  });
}

// ─── Material Issue Hooks ─────────────────────────────────────────────────────

export function useMaterialIssues(params = {}) {
  return useQuery({
    queryKey: queryKeys.procurement.issue.list(params),
    queryFn:  () => procurementApi.issue.list(params),
    select:   (d) => {
      return {
        data:d.data,
        pagination: d.pagination,
      }
    },
    staleTime: 30_000,
  });
}

export function useMaterialIssue(id) {
  return useQuery({
    queryKey: queryKeys.procurement.issue.detail(id),
    queryFn:  () => procurementApi.issue.byId(id),
    select:   (d) => d.data,
    enabled:  Boolean(id),
  });
}

export function useCreateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: procurementApi.issue.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.procurement.issue.all });
      toast.success("สร้างใบเบิกวัสดุสำเร็จ");
    },
  });
}

export function useUpdateIssueStatus(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => procurementApi.issue.updateStatus(id, data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: queryKeys.procurement.issue.all });
      qc.invalidateQueries({ queryKey: queryKeys.procurement.issue.detail(id) });
      const status = res?.data?.status;
      if (status === "ISSUED") {
        qc.invalidateQueries({ queryKey: ["stock"] });
        qc.invalidateQueries({ queryKey: queryKeys.materials.all });
      }
      const labels = { APPROVED: "อนุมัติแล้ว", ISSUED: "จ่ายวัสดุสำเร็จ สต็อกหักแล้ว", CANCELLED: "ยกเลิกแล้ว" };
      toast.success(labels[status] ?? "อัปเดตสำเร็จ");
    },
    onError: (err) => {
      const status = err.response?.status;
      if (status === 409) toast.error("ข้อมูลถูกแก้ไขก่อนหน้า กรุณาโหลดใหม่", { duration: 6000 });
      if (status === 429) toast.error("กำลังประมวลผลอยู่ กรุณารอสักครู่แล้วลองใหม่");
      if (status === 400) toast.error(err.response?.data?.message ?? "สต็อกไม่เพียงพอ");
    },
  });
}
