import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layouts/AppLayout";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";

// ── Auth ──────────────────────────────────────────────────────────────────────
import LoginPage from "@/features/auth/LoginPage";

// ── Dashboard ✅ Phase 5 ──────────────────────────────────────────────────────
import DashboardPage from "@/features/dashboard/DashboardPage";

// ── Phase 2: Inventory + Warehouses ──────────────────────────────────────────
import MaterialsPage from "@/features/inventory/MaterialsPage";
import MaterialDetailPage from "@/features/inventory/MaterialDetailPage";
import WarehousesPage from "@/features/warehouse/WarehousesPage";
import WarehouseDetailPage from "@/features/warehouse/WarehouseDetailPage";

// ── Phase 3: Procurement ──────────────────────────────────────────────────────
import POListPage from "@/features/procurement/POListPage";
import PODetailPage from "@/features/procurement/PODetailPage";
import GRListPage from "@/features/procurement/GRListPage";
import GRDetailPage from "@/features/procurement/GRDetailPage";
import IssueListPage from "@/features/procurement/IssueListPage";
import IssueDetailPage from "@/features/procurement/IssueDetailPage";

// ── Phase 4: Tools + Suppliers ────────────────────────────────────────────────
import ToolsPage from "@/features/tools/ToolsPage";
import ToolDetailPage from "@/features/tools/ToolDetailPage";
import SuppliersPage from "@/features/suppliers/SuppliersPage";

// ── Phase 5: Audit ────────────────────────────────────────────────────────────
import AuditLogPage from "@/features/audit/AuditLogPage";

// ── Phase 6: Barcode, Users, Profile ─────────────────────────────────────────
import BarcodeScannerPage from "@/features/barcode/BarcodeScannerPage";
import UsersPage from "@/features/users/UsersPage";
import ProfilePage from "@/features/profile/ProfilePage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },

          // ── Dashboard ✅ ──────────────────────────────────────────────────
          {
            element: <ProtectedRoute roles={["ADMIN", "MANAGER"]} />,
            children: [{ path: "dashboard", element: <DashboardPage /> }],
          },

          // ── Inventory ✅ ──────────────────────────────────────────────────
          { path: "inventory", element: <MaterialsPage /> },
          { path: "inventory/:id", element: <MaterialDetailPage /> },

          // ── Warehouses ✅ ─────────────────────────────────────────────────
          { path: "warehouses", element: <WarehousesPage /> },
          { path: "warehouses/:id", element: <WarehouseDetailPage /> },

          // ── Procurement ✅ ────────────────────────────────────────────────
          { path: "procurement/po", element: <POListPage /> },
          { path: "procurement/po/:id", element: <PODetailPage /> },
          { path: "procurement/gr", element: <GRListPage /> },
          { path: "procurement/gr/:id", element: <GRDetailPage /> },
          { path: "procurement/issues", element: <IssueListPage /> },
          { path: "procurement/issues/:id", element: <IssueDetailPage /> },

          // ── Tools ✅ ──────────────────────────────────────────────────────
          { path: "tools", element: <ToolsPage /> },
          { path: "tools/:id", element: <ToolDetailPage /> },

          // ── Suppliers ✅ ──────────────────────────────────────────────────
          { path: "suppliers", element: <SuppliersPage /> },

          // ── Barcode Scanner ✅ Phase 6 ────────────────────────────────────
          { path: "barcode", element: <BarcodeScannerPage /> },

          // ── Profile ✅ Phase 6 ────────────────────────────────────────────
          { path: "profile", element: <ProfilePage /> },

          // ── Admin / Manager ───────────────────────────────────────────────
          {
            element: <ProtectedRoute roles={["ADMIN", "MANAGER"]} />,
            children: [
              // ── Audit ✅ Phase 5 ──────────────────────────────────────────
              { path: "audit", element: <AuditLogPage /> },
            ],
          },

          // ── Admin only ────────────────────────────────────────────────────
          {
            element: <ProtectedRoute roles={["ADMIN"]} />,
            children: [
              // ── Users ✅ Phase 6 ──────────────────────────────────────────
              { path: "users", element: <UsersPage /> },
            ],
          },

          { path: "*", element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
]);
