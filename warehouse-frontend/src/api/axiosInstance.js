import axios from "axios";
import { toast } from "sonner";

// ─── Create Instance ──────────────────────────────────────────────────────────
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1",
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// แนบ JWT token จาก localStorage ทุก request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("wms_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  // ✅ Success — return data directly
  (response) => response.data,

  // ❌ Error handling
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่";

    switch (status) {
      case 400:
        // Validation errors handled per-request by react-hook-form / caller
        break;

      case 401:
        // Token หมดอายุหรือไม่ valid
        localStorage.removeItem("wms_token");
        localStorage.removeItem("wms_user");
        toast.error("Session หมดอายุ — กรุณา Login ใหม่");
        // Redirect to login without full reload
        window.location.href = "/login";
        break;

      case 403:
        toast.error("ไม่มีสิทธิ์ดำเนินการนี้");
        break;

      case 404:
        // Let caller handle
        break;

      case 409:
        toast.warning("ข้อมูลถูกแก้ไขก่อนหน้า — กรุณาโหลดใหม่", {
          description: "Optimistic lock conflict",
          duration: 5000,
        });
        break;

      case 429:
        toast.warning("กำลังประมวลผล — กรุณารอสักครู่แล้วลองใหม่");
        break;

      case 500:
      case 502:
      case 503:
        toast.error("เซิร์ฟเวอร์ขัดข้อง", { description: message });
        break;

      default:
        if (!error.response) {
          // Network error / timeout
          toast.error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", {
            description: "กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
          });
        }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
