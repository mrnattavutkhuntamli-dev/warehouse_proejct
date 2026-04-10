import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";
import { useAuth } from "@/hooks/useAuth";
import useUiStore from "@/store/uiStore";
import {
  LayoutDashboard, Package, ShoppingCart, Wrench,
  Warehouse, Truck, BarChart3, QrCode, ClipboardList,
  Users, LogOut, ChevronLeft, ChevronRight,
  AlertTriangle, BookOpen, UserCircle2,
} from "lucide-react";

const NAV_GROUPS = [
  // {
  //   label: "ภาพรวม",
  //   items: [
  //     { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  //   ],
  // },
    {
    label: "ภาพรวม",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: true }, // ✅ เพิ่ม
    ],
  },
  {
    label: "คลังสินค้า",
    items: [
      { to: "/inventory",  label: "วัสดุ & สต็อก",   icon: Package },
      { to: "/warehouses", label: "คลัง & ตำแหน่ง", icon: Warehouse },
    ],
  },
  {
    label: "การจัดซื้อ",
    items: [
      { to: "/procurement/po",     label: "ใบสั่งซื้อ (PO)", icon: ShoppingCart },
      { to: "/procurement/gr",     label: "รับสินค้า (GR)",   icon: Truck },
      { to: "/procurement/issues", label: "ใบเบิกวัสดุ",       icon: ClipboardList },
    ],
  },
  {
    label: "เครื่องมือ & ซัพพลาย",
    items: [
      { to: "/tools",     label: "เครื่องมือ",  icon: Wrench },
      { to: "/suppliers", label: "ผู้จำหน่าย",  icon: BookOpen },
    ],
  },
  {
    label: "เครื่องมือระบบ",
    items: [
      { to: "/barcode", label: "Barcode Scanner", icon: QrCode },
      { to: "/audit",   label: "Audit Logs",      icon: AlertTriangle, managerOnly: true },
    ],
  },
  {
    label: "จัดการ",
    items: [
      { to: "/users",   label: "ผู้ใช้งาน", icon: Users,       adminOnly: true },
      { to: "/profile", label: "โปรไฟล์",   icon: UserCircle2 },
    ],
  },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const { user, logout, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();

  const canSeeAdmin   = isAdmin;
  const canSeeManager = isAdmin || isManager;

  return (
    <aside className={cn(
      "flex flex-col h-screen sticky top-0",
      "bg-[var(--color-surface)] border-r border-[var(--color-border)]",
      "transition-[width] duration-200 ease-in-out overflow-hidden shrink-0",
      sidebarOpen ? "w-60" : "w-14"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex items-center h-14 px-4 border-b border-[var(--color-border)] shrink-0",
        !sidebarOpen && "justify-center px-0"
      )}>
        {sidebarOpen ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded bg-[var(--color-brand)] flex items-center justify-center shrink-0">
              <Warehouse className="w-4 h-4 text-[var(--color-text-inverse)]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[var(--color-text-primary)] font-[var(--font-display)] truncate leading-none">
                WarehouseOS
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] font-mono">v1.0.0</p>
            </div>
          </div>
        ) : (
          <div className="w-7 h-7 rounded bg-[var(--color-brand)] flex items-center justify-center">
            <Warehouse className="w-4 h-4 text-[var(--color-text-inverse)]" />
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => {
            if (item.adminOnly   && !canSeeAdmin)   return false;
            if (item.managerOnly && !canSeeManager) return false;
            return true;
          });
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label}>
              {sidebarOpen && (
                <p className="px-2 mb-1 text-[10px] font-mono font-semibold tracking-widest uppercase text-[var(--color-text-muted)]">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/dashboard"}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 rounded-md px-2 py-2",
                      "text-sm transition-colors duration-100 group relative",
                      !sidebarOpen && "justify-center px-0",
                      isActive
                        ? "bg-[var(--color-brand-subtle)] text-[var(--color-brand)] border border-[var(--color-brand-muted)]"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]"
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={cn(
                          "w-4 h-4 shrink-0 transition-colors",
                          isActive
                            ? "text-[var(--color-brand)]"
                            : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]"
                        )} />
                        {sidebarOpen && <span className="truncate">{item.label}</span>}
                        {/* Collapsed tooltip */}
                        {!sidebarOpen && (
                          <span className={cn(
                            "absolute left-full ml-2 px-2 py-1 text-xs rounded z-50",
                            "bg-[var(--color-surface-3)] border border-[var(--color-border)]",
                            "text-[var(--color-text-primary)] whitespace-nowrap pointer-events-none",
                            "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0",
                            "transition-all duration-150"
                          )}>
                            {item.label}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-[var(--color-border)] p-3 space-y-1">
        {/* User card — click to profile */}
        {sidebarOpen && user && (
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2.5 w-full px-2 py-2 rounded-md bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] transition-colors mb-2 text-left"
          >
            <div className="w-7 h-7 rounded-full bg-[var(--color-brand-subtle)] border border-[var(--color-brand-muted)] flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-[var(--color-brand)] font-mono">
                {user.name?.charAt(0)?.toUpperCase() ?? "U"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate leading-tight">{user.name}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] font-mono truncate">{user.role}</p>
            </div>
          </button>
        )}
        <button
          onClick={logout}
          className={cn(
            "flex items-center gap-3 w-full rounded-md px-2 py-2",
            "text-sm text-[var(--color-text-muted)] hover:text-[var(--color-danger)]",
            "hover:bg-[var(--color-danger-subtle)] transition-colors duration-100",
            !sidebarOpen && "justify-center"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {sidebarOpen && <span>ออกจากระบบ</span>}
        </button>
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center gap-3 w-full rounded-md px-2 py-2",
            "text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
            "hover:bg-[var(--color-surface-2)] transition-colors duration-100",
            !sidebarOpen && "justify-center"
          )}
        >
          {sidebarOpen
            ? <><ChevronLeft className="w-4 h-4 shrink-0" /><span>ซ่อนเมนู</span></>
            : <ChevronRight className="w-4 h-4 shrink-0" />
          }
        </button>
      </div>
    </aside>
  );
}
