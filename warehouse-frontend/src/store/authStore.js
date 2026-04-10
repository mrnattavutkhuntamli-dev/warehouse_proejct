import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Auth Store — Zustand with localStorage persistence
 *
 * State:
 *   token         — JWT string
 *   user          — { id, name, email, role, employeeCode, department }
 *   _hasHydrated  — true หลังจาก persist โหลดข้อมูลจาก localStorage เสร็จ
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user:  null,
      _hasHydrated: false,

      // ── Actions ─────────────────────────────────────────────────────────
      setAuth: (token, user) => {
        localStorage.setItem("wms_token", token);
        set({ token, user });
      },

      setUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem("wms_token");
        localStorage.removeItem("wms_user");
        set({ token: null, user: null });
      },

      // ── Helpers ─────────────────────────────────────────────────────────
      // ✅ เปลี่ยนจาก getter เป็น function ปกติ
      hasRole: (...roles) => {
        const { user } = get();
        if (!user) return false;
        return roles.includes(user.role);
      },

      isAdmin:   () => get().hasRole("ADMIN"),
      isManager: () => get().hasRole("ADMIN", "MANAGER"),
      isStaff:   () => get().hasRole("ADMIN", "MANAGER", "STAFF"),
    }),
    {
      name: "wms_auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user:  state.user,
      }),
      // ✅ set _hasHydrated = true หลัง persist โหลดเสร็จ
      onRehydrateStorage: () => (state) => {
        if (state) state._hasHydrated = true;
      },
    }
  )
);

export default useAuthStore;