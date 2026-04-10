import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosInstance";
import { endpoints } from "@/api/endpoints";
import { queryKeys } from "./queryKeys";

export const auditApi = {
  list:    (params)                => axiosInstance.get(endpoints.audit.list, { params }),
  stats:   (params)                => axiosInstance.get(endpoints.audit.stats, { params }),
  history: (entity, entityId)      => axiosInstance.get(`/audit/history/${entity}/${entityId}`),
};

export function useAuditLogs(params = {}) {
  return useQuery({
    queryKey: queryKeys.audit.list(params),
    queryFn:  () => auditApi.list(params),
    select:   (d) => {
      console.log(d)
      return {
        data:d.data,
        pagination:d.pagination
      }
    },
    staleTime: 30_000,
  });
}

export function useAuditStats(params = {}) {
  return useQuery({
    queryKey: queryKeys.audit.stats(params),
    queryFn:  () => auditApi.stats(params),
    select:   (d) => d.data,
    staleTime: 60_000,
  });
}

export function useEntityAuditHistory(entity, entityId) {
  return useQuery({
    queryKey: queryKeys.audit.history(entity, entityId),
    queryFn:  () => auditApi.history(entity, entityId),
    select:   (d) => d.data,
    enabled:  Boolean(entity && entityId),
  });
}
