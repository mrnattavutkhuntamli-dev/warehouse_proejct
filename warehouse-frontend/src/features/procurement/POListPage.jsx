import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, FileText, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { FormModal } from "@/components/common/FormModal";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { POForm } from "./POForm";
import { usePurchaseOrders } from "@/services/procurementService";
import { useTableParams } from "@/hooks/useTableParams";
import { formatDate, formatCurrency, getStatusLabel } from "@/utils/formatters";
import { cn } from "@/utils/cn";

const PO_STATUSES = ["DRAFT", "APPROVED", "PARTIAL_RECEIVED", "RECEIVED", "CANCELLED"];

const STATUS_TABS = [
  { id: "all",      label: "ทั้งหมด" },
  { id: "DRAFT",    label: "ร่าง" },
  { id: "APPROVED", label: "อนุมัติแล้ว" },
  { id: "RECEIVED", label: "รับครบ" },
  { id: "CANCELLED",label: "ยกเลิก" },
];

export default function POListPage() {
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [statusTab, setStatusTab] = useState("all");

  const { queryParams, setPage, handleSearch, search } = useTableParams();

  const params = { ...queryParams, ...(statusTab !== "all" ? { status: statusTab } : {}) };
  const { data, isLoading, refetch } = usePurchaseOrders(params);
  console.log(`eee` + data)
  const COLUMNS = [
    {
      key: "poNumber", header: "เลขที่ PO", mono: true, skelWidth: "120px",
      render: (v) => (
        <span className="font-mono text-xs font-bold text-[var(--color-brand)]">{v}</span>
      ),
    },
    {
      key: "supplier", header: "ผู้จำหน่าย", skelWidth: "160px",
      render: (_, row) => (
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            {row.supplier?.name ?? "—"}
          </p>
          <p className="text-xs font-mono text-[var(--color-text-muted)]">
            {row.supplier?.code}
          </p>
        </div>
      ),
    },
    {
      key: "status", header: "สถานะ", skelWidth: "90px",
      render: (v) => <Badge status={v}>{getStatusLabel(v)}</Badge>,
    },
    {
      key: "items", header: "รายการ", align: "center", skelWidth: "50px",
      render: (_, row) => (
        <span className="text-xs font-mono text-[var(--color-text-secondary)]">
          {row.items?.length ?? 0} รายการ
        </span>
      ),
    },
    {
      key: "totalAmount", header: "มูลค่ารวม", align: "right", mono: true, skelWidth: "100px",
      render: (v) => (
        <span className="text-sm font-bold tabular-nums text-[var(--color-text-primary)]">
          {formatCurrency(v, 2)}
        </span>
      ),
    },
    {
      key: "createdBy", header: "ผู้สร้าง", skelWidth: "100px",
      render: (_, row) => (
        <span className="text-xs text-[var(--color-text-secondary)]">
          {row.createdBy?.name ?? "—"}
        </span>
      ),
    },
    {
      key: "createdAt", header: "วันที่สร้าง", skelWidth: "90px",
      render: (v) => (
        <span className="text-xs font-mono text-[var(--color-text-muted)]">{formatDate(v)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="ใบสั่งซื้อ (PO)"
        subtitle="Purchase Orders — จัดการการสั่งซื้อวัสดุจากผู้จำหน่าย"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              สร้าง PO ใหม่
            </Button>
          </>
        }
      />

      {/* Status tabs */}
      <div className="flex items-center gap-1 bg-[var(--color-surface-2)] rounded-lg p-1 w-fit border border-[var(--color-border)] flex-wrap">
        {STATUS_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setStatusTab(t.id); setPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150",
              statusTab === t.id
                ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="max-w-xs">
        <Input
          placeholder="ค้นหาเลขที่ PO..."
          prefix={<Search className="w-3.5 h-3.5" />}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <DataTable
        columns={COLUMNS}
        data={data?.data ?? []}
        pagination={data?.pagination}
        onPageChange={setPage}
        loading={isLoading}
        emptyMessage="ยังไม่มีใบสั่งซื้อ"
        onRowClick={(row) => navigate(`/procurement/po/${row.id}`)}
      />

      <FormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="สร้างใบสั่งซื้อใหม่"
        description="กรอกข้อมูล PO และรายการสินค้าที่ต้องการสั่งซื้อ"
        size="xl"
      >
        <POForm onSuccess={() => setCreateOpen(false)} onCancel={() => setCreateOpen(false)} />
      </FormModal>
    </div>
  );
}
