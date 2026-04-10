import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosInstance";
import { endpoints } from "@/api/endpoints";
import { queryKeys } from "./queryKeys";

// ─── Raw API ──────────────────────────────────────────────────────────────────
export const dashboardApi = {
  overview:       ()       => axiosInstance.get(endpoints.dashboard.overview),
  inventoryValue: ()       => axiosInstance.get(endpoints.dashboard.inventoryValue),
  topIssued:      (params) => axiosInstance.get(endpoints.dashboard.topIssued, { params }),
  supplierStats:  ()       => axiosInstance.get(endpoints.dashboard.supplierStats),
  stockMovement:  (params) => axiosInstance.get(endpoints.dashboard.stockMovement, { params }),
  toolUtil:       ()       => axiosInstance.get(endpoints.dashboard.toolUtil),
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** KPI overview — auto-refresh every 5 min */
export function useDashboardOverview() {
  return useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn:  dashboardApi.overview,
    select:   (d) => d.data,
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });
}

/** Inventory value per category */
export function useInventoryValue() {
  return useQuery({
    queryKey: queryKeys.dashboard.inventoryValue,
    queryFn:  dashboardApi.inventoryValue,
    select:   (d) => d.data,
    staleTime: 5 * 60_000,
  });
}

/** Top N most-issued materials */
export function useTopIssuedMaterials(params = { limit: 10 }) {
  return useQuery({
    queryKey: queryKeys.dashboard.topIssued(params),
    queryFn:  () => dashboardApi.topIssued(params),
    select:   (d) => d.data,
    staleTime: 5 * 60_000,
  });
}

/** Supplier order stats */
export function useSupplierStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.supplierStats,
    queryFn:  dashboardApi.supplierStats,
    select:   (d) => d.data,
    staleTime: 5 * 60_000,
  });
}

/**
 * Stock movement over time
 * @param {{ days?: number, materialId?: string }} params
 */
export function useStockMovement(params = { days: 30 }) {
  return useQuery({
    queryKey: queryKeys.dashboard.stockMovement(params),
    queryFn:  () => dashboardApi.stockMovement(params),
    select:   (d) => d.data,
    staleTime: 2 * 60_000,
  });
}

/** Tool utilization — borrowed vs available */
export function useToolUtilization() {
  return useQuery({
    queryKey: queryKeys.dashboard.toolUtil,
    queryFn:  dashboardApi.toolUtil,
    select:   (d) => d.data,
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
  });
}
