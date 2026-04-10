import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Pencil, Package, MapPin, ArrowDownUp,
  RefreshCw, ChevronRight, TrendingDown, TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/common/DataTable";
import { FormModal } from "@/components/common/FormModal";
import { MaterialForm } from "./MaterialForm";
import { useMaterial } from "@/services/materialsService";
import { useStockTransactions } from "@/services/stockService";
import { formatNumber, formatDate, formatDateTime, getStatusLabel, getStatusColor } from "@/utils/formatters";
import { cn } from "@/utils/cn";

const TX_TYPE_ICON = {
  IN:       { icon: TrendingUp,   color: "text-[var(--color-success)]" },
  OUT:      { icon: TrendingDown, color: "text-[var(--color-danger)]" },
  ADJUST:   { icon: ArrowDownUp,  color: "text-[var(--color-info)]" },
  TRANSFER: { icon: ArrowDownUp,  color: "text-[var(--color-brand)]" },
  RETURN:   { icon: TrendingUp,   color: "text-[var(--color-warning)]" },
};

const TX_COLUMNS = [
  {
    key: "type", header: "ประเภท", skelWidth: "70px",
    render: (v) => {
      const meta = TX_TYPE_ICON[v] ?? {};
      const Icon = meta.icon ?? ArrowDownUp;
      return (
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4", meta.color)} />
          <Badge status={v}>{getStatusLabel(v)}</Badge>
        </div>
      );
    },
  },
  {
    key: "quantity", header: "จำนวน", align: "right", mono: true, skelWidth: "70px",
    render: (v, row) => {
      const isIn = ["IN", "RETURN"].includes(row.type);
      return (
        <span className={cn("font-bold tabular-nums", isIn ? "text-[var(--color-success)]" : "text-[var(--color-danger)]")}>
          {isIn ? "+" : "-"}{formatNumber(v, 2)} {row.material?.unit}
        </span>
      );
    },
  },
  {
    key: "location", header: "Location", skelWidth: "100px",
    render: (_, row) => (
      <span className="text-xs font-mono text-[var(--color-text-secondary)]">
        {row.location?.code ?? "—"}
        {row.location?.warehouse && (
          <span className="text-[var(--color-text-muted)] ml-1">({row.location.warehouse.name})</span>
        )}
      </span>
    ),
  },
  {
    key: "note", header: "หมายเหตุ", skelWidth: "120px",
    render: (v) => <span className="text-xs text-[var(--color-text-muted)]">{v ?? "—"}</span>,
  },
  {
    key: "createdBy", header: "โดย", skelWidth: "90px",
    render: (_, row) => (
      <span className="text-xs text-[var(--color-text-secondary)]">{row.createdBy?.name ?? "ระบบ"}</span>
    ),
  },
  {
    key: "createdAt", header: "วันที่เวลา", skelWidth: "100px",
    render: (v) => <span className="text-xs font-mono text-[var(--color-text-muted)]">{formatDateTime(v)}</span>,
  },
];

export default function MaterialDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [txPage, setTxPage] = useState(1);

  const { data: material, isLoading, refetch } = useMaterial(id);
  const { data: txData, isLoading: txLoading } = useStockTransactions({
    materialId: id, page: txPage, limit: 15,
  });

  const stocks = material?.stocks ?? [];
  const totalStock = stocks.reduce((s, st) => s + (st.quantity ?? 0), 0);
  const isLow = totalStock <= (material?.minStock ?? 0);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-28 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <Package className="w-12 h-12 text-[var(--color-text-muted)]" />
        <p className="text-[var(--color-text-muted)]">ไม่พบวัสดุนี้</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/inventory")}>
          <ArrowLeft className="w-4 h-4" /> กลับ
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={
          <span className="flex items-center gap-1">
            <Link to="/inventory" className="hover:text-[var(--color-text-primary)] transition-colors">วัสดุ & สต็อก</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="font-mono text-[var(--color-brand)]">{material.code}</span>
          </span>
        }
        title={material.name}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/inventory")}>
              <ArrowLeft className="w-3.5 h-3.5" />กลับ
            </Button>
            <Button size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="w-3.5 h-3.5" />แก้ไข
            </Button>
          </>
        }
      />

      {/* Info cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock */}
        <Card className={cn("border", isLow && "border-[var(--color-danger)] bg-[var(--color-danger-subtle)]/30")}>
          <CardContent className="pt-5">
            <p className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)] mb-1">สต็อกรวม</p>
            <p className={cn("text-2xl font-bold font-mono tabular-nums", isLow ? "text-[var(--color-danger)]" : "text-[var(--color-text-primary)]")}>
              {formatNumber(totalStock, 2)}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{material.unit}</p>
            {isLow && (
              <p className="text-xs text-[var(--color-danger)] mt-1.5 font-semibold">⚠ ต่ำกว่าขั้นต่ำ</p>
            )}
          </CardContent>
        </Card>

        {/* Min Stock */}
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)] mb-1">สต็อกต่ำสุด</p>
            <p className="text-2xl font-bold font-mono tabular-nums text-[var(--color-warning)]">
              {formatNumber(material.minStock, 0)}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{material.unit}</p>
          </CardContent>
        </Card>

        {/* Category */}
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)] mb-2">หมวดหมู่</p>
            <Badge variant="default" className="text-sm px-3 py-1">
              {material.category?.name ?? "—"}
            </Badge>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)] mb-2">สถานะ</p>
            <Badge variant={material.isActive ? "success" : "cancelled"} className="text-sm px-3 py-1">
              {material.isActive ? "ใช้งาน" : "ปิดใช้งาน"}
            </Badge>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              แก้ไขล่าสุด {formatDate(material.updatedAt)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {material.description && (
        <p className="text-sm text-[var(--color-text-secondary)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-3">
          {material.description}
        </p>
      )}

      {/* Stock by Location */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[var(--color-brand)]" />
            <CardTitle>สต็อกแยกตาม Location</CardTitle>
            <span className="text-xs text-[var(--color-text-muted)] font-mono ml-auto">
              {stocks.length} ตำแหน่ง
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {stocks.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-6">ยังไม่มีสต็อกในระบบ</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stocks.map((st) => (
                <div key={st.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                >
                  <div>
                    <p className="text-xs font-mono text-[var(--color-brand)]">{st.location?.code}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{st.location?.warehouse?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold tabular-nums text-[var(--color-text-primary)]">
                      {formatNumber(st.quantity, 2)}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">{material.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ArrowDownUp className="w-4 h-4 text-[var(--color-brand)]" />
            <CardTitle>ประวัติการเคลื่อนไหวสต็อก</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={TX_COLUMNS}
            data={txData?.data ?? []}
            pagination={txData?.pagination}
            onPageChange={setTxPage}
            loading={txLoading}
            emptyMessage="ยังไม่มีประวัติ Transaction"
          />
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <FormModal open={editOpen} onOpenChange={setEditOpen}
        title="แก้ไขวัสดุ" description={material.name} size="md">
        <MaterialForm
          defaultValues={material}
          onSuccess={() => { setEditOpen(false); refetch(); }}
          onCancel={() => setEditOpen(false)}
        />
      </FormModal>
    </div>
  );
}
