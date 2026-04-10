import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "@/store/authStore";

/**
 * ProtectedRoute — redirect to /login if not authenticated
 * Optionally restrict to specific roles
 *
 * @param {string[]} roles — allowed roles, undefined = any auth user
 */
export function ProtectedRoute({ roles }) {
  const { token, user, _hasHydrated } = useAuthStore();
  const location = useLocation();

  // ✅ รอให้ persist โหลดข้อมูลจาก localStorage เสร็จก่อน
  // ป้องกันการ redirect ไป /login ก่อนที่ token จะถูกโหลดขึ้นมา
  if (!_hasHydrated) {
    return null; // หรือจะ return <LoadingSpinner /> ก็ได้
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}