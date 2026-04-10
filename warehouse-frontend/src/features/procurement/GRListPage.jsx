import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Search, Truck, RefreshCw, FileDown } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { FormModal } from "@/components/common/FormModal";
import { GRForm } from "./GRForm";
import { useGoodsReceipts } from "@/services/procurementService";
import { usePdfDownload } from "@/hooks/usePdfDownload";
import { useTableParams } from "@/hooks/useTableParams";
import { formatDate, formatCurrency } from "@/utils/formatters";

export default function GRListPage() {
  const navigate = useNavigate();
  const locationState = useLocation().state;
  // รองรับกรณีกด "รับสินค้า" จาก PODetailPage — เปิด form พร้อม poId
  const [createOpen, setCreateOpen] = useState(Boolean(locationState?.poId));
  const [defaultPoId] = useState(locationState?.poId ?? null);

  const { queryParams, setPage, handleSearch, search } = useTableParams();
  const { data, isLoading, refetch } = useGoodsReceipts(queryParams);
  const { downloadGR, isDownloading } = usePdfDownload();

  const COLUMNS = [
    {
      key: "grNumber", header: "เลขที่ GR", mono: true, skelWidth: "120px",
      render: (v) => <span className="font-mono text-xs font-bold text-[var(--color-success)]">{v}</span>,
    },
    {
      key: "supplier", header: "ผู้จำหน่าย", skelWidth: "160px",
      render: (_, row) => (
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">{row.supplier?.name ?? "—"}</p>
          <p className="text-xs font-mono text-[var(--color-text-muted)]">{row.supplier?.code}</p>
        </div>
      ),
    },
    {
      key: "purchaseOrder", header: "อ้างอิง PO", skelWidth: "120px",
      render: (_, row) => row.purchaseOrder ? (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/procurement/po/${row.purchaseOrder.id}`); }}
          className="font-mono text-xs text-[var(--color-brand)] hover:underline"
        >
          {row.purchaseOrder.poNumber}
        </button>
      ) : <span className="text-xs text-[var(--color-text-muted)]">—</span>,
    },
    {
      key: "items", header: "รายการ", align: "center", skelWidth: "60px",
      render: (_, row) => (
        <span className="text-xs font-mono text-[var(--color-text-secondary)]">
          {row.items?.length ?? 0} รายการ
        </span>
      ),
    },
    {
      key: "totalAmount", header: "มูลค่ารวม", align: "right", mono: true, skelWidth: "110px",
      render: (v) => (
        <span className="text-sm font-bold tabular-nums text-[var(--color-text-primary)]">
          {formatCurrency(v)}
        </span>
      ),
    },
    {
      key: "receivedBy", header: "ผู้รับ", skelWidth: "100px",
      render: (_, row) => <span className="text-xs text-[var(--color-text-secondary)]">{row.receivedBy?.name ?? "—"}</span>,
    },
    {
      key: "createdAt", header: "วันที่รับ", skelWidth: "90px",
      render: (v) => <span className="text-xs font-mono text-[var(--color-text-muted)]">{formatDate(v)}</span>,
    },
    {
      key: "_pdf", header: "", skelWidth: "40px",
      render: (_, row) => (
        <Button
          variant="ghost" size="icon-sm"
          onClick={(e) => { e.stopPropagation(); downloadGR(row.id); }}
          loading={isDownloading}
          title="ดาวน์โหลด PDF"
        >
          <FileDown className="w-3.5 h-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="รับสินค้า (GR)"
        subtitle="Goods Receipts — บันทึกการรับสินค้าเข้าคลัง"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              บันทึกรับสินค้า
            </Button>
          </>
        }
      />

      <div className="max-w-xs">
        <Input
          placeholder="ค้นหาเลขที่ GR..."
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
        emptyMessage="ยังไม่มีรายการรับสินค้า"
        onRowClick={(row) => navigate(`/procurement/gr/${row.id}`)}
      />

      <FormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="บันทึกรับสินค้า"
        description="กรอกข้อมูลการรับสินค้า — สต็อกจะถูกอัปเดตทันทีเมื่อบันทึก"
        size="xl"
      >
        <GRForm
          defaultPoId={defaultPoId}
          onSuccess={() => setCreateOpen(false)}
          onCancel={() => setCreateOpen(false)}
        />
      </FormModal>
    </div>
  );
}
