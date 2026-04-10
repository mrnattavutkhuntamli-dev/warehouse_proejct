import { useLocation, Link } from "react-router-dom";
import { Bell, Search, QrCode, Menu } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useUiStore from "@/store/uiStore";
import { useAuth } from "@/hooks/useAuth";

// Map route → breadcrumb label
const ROUTE_LABELS = {
  "/dashboard":          "Dashboard",
  "/inventory":          "วัสดุ & สต็อก",
  "/warehouses":         "คลัง & ตำแหน่ง",
  "/procurement/po":     "ใบสั่งซื้อ",
  "/procurement/gr":     "รับสินค้า",
  "/procurement/issues": "ใบเบิกวัสดุ",
  "/tools":              "เครื่องมือ",
  "/suppliers":          "ผู้จำหน่าย",
  "/reports":            "รายงาน",
  "/barcode":            "Barcode Scanner",
  "/audit":              "Audit Logs",
  "/users":              "ผู้ใช้งาน",
};

export function Navbar() {
  const location = useLocation();
  const { toggleMobileSidebar, openScanner } = useUiStore();
  const { user } = useAuth();

  // Find current page label
  const currentLabel = Object.entries(ROUTE_LABELS)
    .find(([path]) => location.pathname.startsWith(path))?.[1] ?? "WarehouseOS";

  return (
    <header className="sticky top-0 z-30 h-14 flex items-center gap-3 px-4 bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-[var(--color-border)] shrink-0">
      {/* Mobile menu */}
      <Button
        variant="ghost" size="icon-sm"
        className="md:hidden"
        onClick={toggleMobileSidebar}
      >
        <Menu className="w-4 h-4" />
      </Button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
          {currentLabel}
        </h2>
      </div>

      {/* Search */}
      <div className="hidden sm:block w-56">
        <Input
          placeholder="ค้นหา..."
          prefix={<Search className="w-3.5 h-3.5" />}
          className="h-8 text-xs"
        />
      </div>

      {/* QR Scanner shortcut */}
      <Button variant="ghost" size="icon-sm" onClick={openScanner} title="เปิด QR Scanner">
        <QrCode className="w-4 h-4" />
      </Button>

      {/* Notifications (placeholder) */}
      <Button variant="ghost" size="icon-sm" className="relative" title="การแจ้งเตือน">
        <Bell className="w-4 h-4" />
        {/* Unread dot */}
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-danger)]" />
      </Button>

      {/* User avatar */}
      {user && (
        <Link to="/profile" className="shrink-0">
          <div className="w-7 h-7 rounded-full bg-[var(--color-brand-subtle)] border border-[var(--color-brand-muted)] flex items-center justify-center hover:border-[var(--color-brand)] transition-colors">
            <span className="text-xs font-bold text-[var(--color-brand)] font-mono">
              {user.name?.charAt(0)?.toUpperCase() ?? "U"}
            </span>
          </div>
        </Link>
      )}
    </header>
  );
}
