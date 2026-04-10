import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance";
import { endpoints } from "@/api/endpoints";
import useAuthStore from "@/store/authStore";

/**
 * useAuth — wraps Zustand auth store + TanStack Query mutations
 *
 * Returns:
 *   user, token, isAuth, isAdmin(), isManager(), isStaff()
 *   login(credentials) — async mutation
 *   logout()
 *   changePassword(data)
 */
export function useAuth() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, token, setAuth, logout: storeLogout, hasRole, isAdmin, isManager, isStaff } = useAuthStore();

  // ── Login ─────────────────────────────────────────────────────────────────
  const loginMutation = useMutation({
    mutationFn: (credentials) =>
      axiosInstance.post(endpoints.auth.login, credentials),
    onSuccess: (data) => {
      setAuth(data.data.token, data.data.user);
      toast.success(`ยินดีต้อนรับ ${data.data.user.name}`);
      navigate("/dashboard", { replace: true });
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
      toast.error(msg);
    },
  });

  // ── Change Password ───────────────────────────────────────────────────────
  const changePasswordMutation = useMutation({
    mutationFn: (data) =>
      axiosInstance.patch(endpoints.auth.changePassword, data),
    onSuccess: () => {
      toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
    },
  });

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    storeLogout();
    qc.clear();
    navigate("/login", { replace: true });
    toast.info("ออกจากระบบแล้ว");
  };

  return {
    user,
    token,
    isAuth: Boolean(token),
    hasRole,
    isAdmin:   isAdmin(),
    isManager: isManager(),
    isStaff:   isStaff(),
    login:          loginMutation.mutate,
    loginAsync:     loginMutation.mutateAsync,
    isLoggingIn:    loginMutation.isPending,
    loginError:     loginMutation.error,
    logout,
    changePassword: changePasswordMutation.mutate,
    isChangingPwd:  changePasswordMutation.isPending,
  };
}
