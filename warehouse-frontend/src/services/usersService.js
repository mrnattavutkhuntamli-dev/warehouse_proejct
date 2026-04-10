import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance";
import { endpoints } from "@/api/endpoints";
import { queryKeys } from "./queryKeys";

// ─── Raw API ──────────────────────────────────────────────────────────────────
export const usersApi = {
  list:   (params)     => axiosInstance.get(endpoints.users.list, { params }),
  byId:   (id)         => axiosInstance.get(endpoints.users.byId(id)),
  create: (data)       => axiosInstance.post(endpoints.users.create, data),
  update: (id, data)   => axiosInstance.put(endpoints.users.update(id), data),
  remove: (id)         => axiosInstance.delete(endpoints.users.remove(id)),
  departments: {
    list:   (params)   => axiosInstance.get(endpoints.users.departments.list, { params }),
    create: (data)     => axiosInstance.post(endpoints.users.departments.create, data),
    update: (id, data) => axiosInstance.put(endpoints.users.departments.update(id), data),
    remove: (id)       => axiosInstance.delete(endpoints.users.departments.remove(id)),
  },
  profile:        ()     => axiosInstance.get(endpoints.auth.profile),
  changePassword: (data) => axiosInstance.patch(endpoints.auth.changePassword, data),
};

// ─── Hooks ────────────────────────────────────────────────────────────────────


export function useUsers(params = {}) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn:  () => usersApi.list(params),
    select: (d) => {
      return {
        data: d.data,
        pagination: d.pagination,
      };
    },
    staleTime: 2 * 60_000,
  });
}

export function useUser(id) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn:  () => usersApi.byId(id),
    select:   (d) => d.data,
    enabled:  Boolean(id),
  });
}

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn:  usersApi.profile,
    select:   (d) => d.data,
    staleTime: 5 * 60_000,
  });
}




export function useDepartments(params = {}) {
   return useQuery({
    queryKey: queryKeys.users.departments.list(params),
    queryFn:  () => usersApi.departments.list(params),
    select:   (d) => {
      return {
        data:d.data
      }
    },
    staleTime: 5 * 60_000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("สร้างบัญชีผู้ใช้สำเร็จ");
    },
  });
}

export function useUpdateUser(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => usersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
      qc.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      toast.success("แก้ไขข้อมูลผู้ใช้สำเร็จ");
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => usersApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("ปิดใช้งานบัญชีแล้ว");
    },
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.departments.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.departments.all });
      toast.success("เพิ่มแผนกสำเร็จ");
    },
  });
}

export function useUpdateDepartment(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => usersApi.departments.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.departments.all });
      toast.success("แก้ไขแผนกสำเร็จ");
    },
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => usersApi.departments.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.departments.all });
      toast.success("ลบแผนกแล้ว");
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: usersApi.changePassword,
    onSuccess: () => toast.success("เปลี่ยนรหัสผ่านสำเร็จ"),
    onError: (err) => {
      const msg = err.response?.data?.message ?? "เปลี่ยนรหัสผ่านไม่สำเร็จ";
      toast.error(msg);
    },
  });
}

// ─── barcode service (companion) ──────────────────────────────────────────────
export const barcodeApi = {
  scan:     (data)   => axiosInstance.post(endpoints.barcode.scan, data),
  bulk:     (data)   => axiosInstance.post(endpoints.barcode.bulk, data),
  material: (id)     => axiosInstance.get(endpoints.barcode.material(id)),
  location: (id)     => axiosInstance.get(endpoints.barcode.location(id)),
  tool:     (id)     => axiosInstance.get(endpoints.barcode.tool(id)),
};
