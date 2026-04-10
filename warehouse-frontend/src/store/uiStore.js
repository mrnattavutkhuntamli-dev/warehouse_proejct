import { create } from "zustand";

/**
 * UI Store — sidebar open/close, active modals, global loading
 */
const useUiStore = create((set, get) => ({
  // ── Sidebar ───────────────────────────────────────────────────────────────
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // ── Mobile sidebar (drawer) ───────────────────────────────────────────────
  mobileSidebarOpen: false,
  toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),

  // ── Modals stack ─────────────────────────────────────────────────────────
  // { id: string, props: object }[]
  modals: [],
  openModal: (id, props = {}) =>
    set((s) => ({
      modals: [...s.modals.filter((m) => m.id !== id), { id, props }],
    })),
  closeModal: (id) =>
    set((s) => ({ modals: s.modals.filter((m) => m.id !== id) })),
  isModalOpen: (id) => get().modals.some((m) => m.id === id),
  getModalProps: (id) => get().modals.find((m) => m.id === id)?.props ?? {},

  // ── Global loading overlay (used for PDF download etc.) ───────────────────
  globalLoading: false,
  setGlobalLoading: (v) => set({ globalLoading: v }),

  // ── Barcode scanner ───────────────────────────────────────────────────────
  scannerOpen: false,
  openScanner:  () => set({ scannerOpen: true }),
  closeScanner: () => set({ scannerOpen: false }),
}));

export default useUiStore;
