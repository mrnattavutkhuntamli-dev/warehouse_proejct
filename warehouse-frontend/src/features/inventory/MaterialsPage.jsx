import { useState } from "react";
import {
  Plus,
  RefreshCw,
  Search,
  AlertTriangle,
  Pencil,
  Trash2,
  Filter,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { FormModal } from "@/components/common/FormModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { MaterialForm } from "./MaterialForm";
import {
  useMaterials,
  useDeleteMaterial,
  useMaterialCategories,
  useLowStock,
} from "@/services";
import { useTableParams } from "@/hooks/useTableParams";
import { formatNumber, formatDate } from "@/utils/formatters";
import { cn } from "@/utils/cn";

export default function MaterialsPage() {
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [tab, setTab] = useState("all");

  const { queryParams, setPage, handleSearch, handleFilter, search, filters } =
    useTableParams();
  const { data, isLoading, refetch } = useMaterials(queryParams);
  const { data: lowStockData, isLoading: loadingLow } = useLowStock();
  const { data: categoriesData } = useMaterialCategories();
  const deleteMutation = useDeleteMaterial();

  const categories = categoriesData ?? [];
  // const materials = (tab === "low-stock" ? lowStockData : data?.data) ?? [];
  const materials = (tab === "low-stock" ? lowStockData : data) ?? [];
  const pagination = tab === "all" ? data?.pagination : null;
  const lowCount = lowStockData?.length ?? 0;

  const COLUMNS = [
    {
      key: "code",
      header: "รหัส",
      mono: true,
      skelWidth: "70px",
      render: (v) => (
        <span className="text-xs font-mono text-[var(--color-brand)]">{v}</span>
      ),
    },
    {
      key: "name",
      header: "ชื่อวัสดุ",
      skelWidth: "200px",
      render: (v, row) => (
        <div>
          <p className="text-sm text-[var(--color-text-primary)] font-medium">
            {v}
          </p>
          {row.description && (
            <p className="text-xs text-[var(--color-text-muted)] truncate max-w-[240px]">
              {row.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "category",
      header: "หมวดหมู่",
      skelWidth: "100px",
      render: (_, row) => (
        <Badge variant="default">{row.category?.name ?? "—"}</Badge>
      ),
    },
    {
      key: "unit",
      header: "หน่วย",
      skelWidth: "50px",
      render: (v) => (
        <span className="text-xs text-[var(--color-text-muted)] font-mono">
          {v}
        </span>
      ),
    },
    {
      key: "minStock",
      header: "สต็อกรวม / ต่ำสุด",
      align: "right",
      mono: true,
      skelWidth: "90px",
      render: (v, row) => {
        const total =
          row.stocks?.reduce((s, st) => s + (st.quantity ?? 0), 0) ?? null;
        const isLow = total !== null && total <= v;
        return (
          <div className="text-right">
            {total !== null && (
              <p
                className={cn(
                  "text-sm font-bold font-mono tabular-nums",
                  isLow
                    ? "text-[var(--color-danger)]"
                    : "text-[var(--color-text-primary)]",
                )}
              >
                {formatNumber(total, 2)} {row.unit}
              </p>
            )}
            <p className="text-[11px] text-[var(--color-text-muted)]">
              ต่ำสุด {formatNumber(v, 0)}
            </p>
          </div>
        );
      },
    },
    {
      key: "isActive",
      header: "สถานะ",
      skelWidth: "60px",
      render: (v) => (
        <Badge variant={v ? "success" : "cancelled"}>
          {v ? "ใช้งาน" : "ปิด"}
        </Badge>
      ),
    },
    {
      key: "updatedAt",
      header: "แก้ไขล่าสุด",
      skelWidth: "90px",
      render: (v) => (
        <span className="text-xs text-[var(--color-text-muted)] font-mono">
          {formatDate(v)}
        </span>
      ),
    },
    {
      key: "_actions",
      header: "",
      skelWidth: "60px",
      render: (_, row) => (
        <div
          className="flex items-center gap-1 justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setEditTarget(row)}
            title="แก้ไข"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)]"
            onClick={() => setDeleteTarget(row)}
            title="ปิดใช้งาน"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="วัสดุ & สต็อก"
        subtitle="จัดการรายการวัสดุและระดับสต็อกทั้งหมด"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-3.5 h-3.5" />
              รีเฟรช
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              เพิ่มวัสดุ
            </Button>
          </>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[var(--color-surface-2)] rounded-lg p-1 w-fit border border-[var(--color-border)]">
        {[
          { id: "all", label: "ทั้งหมด", icon: Package },
          {
            id: "low-stock",
            label: "สต็อกต่ำ",
            icon: AlertTriangle,
            count: lowCount,
          },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150",
              tab === t.id
                ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
            )}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.count > 0 && (
              <span className="bg-[var(--color-danger)] text-white text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full leading-none">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      {tab === "all" && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] max-w-xs">
            <Input
              placeholder="ค้นหาวัสดุ..."
              prefix={<Search className="w-3.5 h-3.5" />}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="w-44">
            <Select
              value={filters.categoryId ?? "ALL"}
              onValueChange={(v) =>
                handleFilter("categoryId", v === "ALL" ? null : v)
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  <SelectValue placeholder="หมวดหมู่" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {/* ✅ ใช้ value="ALL" แทน value="" */}
                <SelectItem value="ALL">ทุกหมวดหมู่</SelectItem>
                {categories
                  .filter((c) => Boolean(c.id))
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-36">
            <Select
              value={filters.isActive ?? "ALL"}
              onValueChange={(v) =>
                handleFilter("isActive", v === "ALL" ? null : v)
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                {/* ✅ ใช้ value="ALL" แทน value="" */}
                <SelectItem value="ALL">ทุกสถานะ</SelectItem>
                <SelectItem value="true">ใช้งาน</SelectItem>
                <SelectItem value="false">ปิด</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <DataTable
        columns={COLUMNS}
        data={materials}
        pagination={pagination}
        onPageChange={setPage}
        loading={tab === "all" ? isLoading : loadingLow}
        emptyMessage={
          tab === "low-stock" ? "🎉 ไม่มีวัสดุที่สต็อกต่ำ" : "ไม่พบรายการวัสดุ"
        }
        onRowClick={(row) => navigate(`/inventory/${row.id}`)}
      />

      <FormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="เพิ่มวัสดุใหม่"
        description="กรอกข้อมูลวัสดุที่ต้องการเพิ่มเข้าระบบ"
        size="md"
      >
        <MaterialForm
          onSuccess={() => setCreateOpen(false)}
          onCancel={() => setCreateOpen(false)}
        />
      </FormModal>

      <FormModal
        open={Boolean(editTarget)}
        onOpenChange={(o) => !o && setEditTarget(null)}
        title="แก้ไขวัสดุ"
        description={editTarget?.name}
        size="md"
      >
        <MaterialForm
          defaultValues={editTarget}
          onSuccess={() => setEditTarget(null)}
          onCancel={() => setEditTarget(null)}
        />
      </FormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`ปิดใช้งาน "${deleteTarget?.name}"?`}
        description="วัสดุจะไม่ถูกลบออกจากระบบ แต่จะถูกซ่อนจากรายการทั้งหมด"
        confirmLabel="ปิดใช้งาน"
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
