import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, CheckCircle2, XCircle,
  FileDown, RefreshCw, Truck, Building2, User, CalendarDays,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusFlow } from "@/components/common/StatusFlow";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { usePurchaseOrder, useUpdatePOStatus } from "@/services/procurementService";
import { usePdfDownload } from "@/hooks/usePdfDownload";
import { formatDate, formatDateTime, formatCurrency, formatNumber, getStatusLabel } from "@/utils/formatters";
import { cn } from "@/utils/cn";

const PO_STEPS = [
  { key: "DRAFT",             label: "ร่าง" },
  { key: "APPROVED",          label: "อนุมัติ" },
  { key: "PARTIAL_RECEIVED",  label: "รับบางส่วน" },
  { key: "RECEIVED",          label: "รับครบ" },
];

export default function PODetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [approveConfirm, setApproveConfirm] = useState(false);
  const [cancelConfirm, setCancelConfirm]   = useState(false);

  const { data: po, isLoading, refetch } = usePurchaseOrder(id);
  const statusMutation = useUpdatePOStatus(id);
  const { downloadPO, isDownloading } = usePdfDownload();

  const handleApprove = async () => {
    await statusMutation.mutateAsync({
      status:  "APPROVED",
      version: po.updatedAt, // Optimistic lock
    });
    setApproveConfirm(false);
  };

  const handleCancel = async () => {
    await statusMutation.mutateAsync({ status: "CANCELLED" });
    setCancelConfirm(false);
  };

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in">
      <div className="skeleton h-8 w-64 rounded" />
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-lg" />)}
      </div>
      <div className="skeleton h-48 rounded-lg" />
    </div>
  );

  if (!po) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
      <p className="text-[var(--color-text-muted)]">ไม่พบ Purchase Order นี้</p>
      <Button variant="outline" size="sm" onClick={() => navigate("/procurement/po")}>
        <ArrowLeft className="w-4 h-4" /> กลับ
      </Button>
    </div>
  );

  const isDraft     = po.status === "DRAFT";
  const isCancelled = po.status === "CANCELLED";
  const canApprove  = isDraft;
  const canCancel   = isDraft;
  const canReceive  = po.status === "APPROVED" || po.status === "PARTIAL_RECEIVED";

  const grandTotal = po.items?.reduce((s, i) => s + i.quantity * i.unitPrice, 0) ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        breadcrumb={
          <span className="flex items-center gap-1">
            <Link to="/procurement/po" className="hover:text-[var(--color-text-primary)] transition-colors">ใบสั่งซื้อ</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="font-mono text-[var(--color-brand)]">{po.poNumber}</span>
          </span>
        }
        title={po.poNumber}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline" size="sm"
              loading={isDownloading}
              onClick={() => downloadPO(id)}
            >
              <FileDown className="w-3.5 h-3.5" />
              PDF
            </Button>
            {canReceive && (
              <Button
                variant="secondary" size="sm"
                onClick={() => navigate("/procurement/gr", { state: { poId: id } })}
              >
                <Truck className="w-3.5 h-3.5" />
                รับสินค้า
              </Button>
            )}
            {canCancel && (
              <Button
                variant="ghost-destructive" size="sm"
                onClick={() => setCancelConfirm(true)}
              >
                <XCircle className="w-3.5 h-3.5" />
                ยกเลิก
              </Button>
            )}
            {canApprove && (
              <Button size="sm" onClick={() => setApproveConfirm(true)}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                อนุมัติ
              </Button>
            )}
          </div>
        }
      />

      {/* Status flow */}
      {!isCancelled ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-6 py-5">
          <StatusFlow steps={PO_STEPS} current={po.status} />
        </div>
      ) : (
        <div className="bg-[var(--color-danger-subtle)] border border-[var(--color-danger)] rounded-lg px-5 py-3 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-[var(--color-danger)]" />
          <span className="text-sm font-semibold text-[var(--color-danger)]">ใบสั่งซื้อนี้ถูกยกเลิกแล้ว</span>
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Supplier */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="w-4 h-4 text-[var(--color-brand)]" />ผู้จำหน่าย</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            <p className="font-mono text-xs text-[var(--color-brand)]">{po.supplier?.code}</p>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{po.supplier?.name}</p>
            {po.supplier?.phone && <p className="text-xs text-[var(--color-text-muted)]">📞 {po.supplier.phone}</p>}
            {po.supplier?.email && <p className="text-xs text-[var(--color-text-muted)]">✉ {po.supplier.email}</p>}
          </CardContent>
        </Card>

        {/* Parties */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-4 h-4 text-[var(--color-brand)]" />ผู้เกี่ยวข้อง</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-[10px] font-mono uppercase text-[var(--color-text-muted)]">ผู้สร้าง</p>
              <p className="text-sm text-[var(--color-text-primary)]">{po.createdBy?.name ?? "—"}</p>
            </div>
            {po.approvedBy && (
              <div>
                <p className="text-[10px] font-mono uppercase text-[var(--color-text-muted)]">ผู้อนุมัติ</p>
                <p className="text-sm text-[var(--color-text-primary)]">{po.approvedBy?.name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-[var(--color-brand)]" />วันที่</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-[10px] font-mono uppercase text-[var(--color-text-muted)]">วันที่สร้าง</p>
              <p className="text-sm font-mono text-[var(--color-text-primary)]">{formatDate(po.createdAt)}</p>
            </div>
            {po.approvedAt && (
              <div>
                <p className="text-[10px] font-mono uppercase text-[var(--color-text-muted)]">วันที่อนุมัติ</p>
                <p className="text-sm font-mono text-[var(--color-text-primary)]">{formatDate(po.approvedAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Note */}
      {po.note && (
        <div className="px-4 py-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">
          <span className="text-[10px] font-mono uppercase text-[var(--color-text-muted)] block mb-1">หมายเหตุ</span>
          {po.note}
        </div>
      )}

      {/* Items table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการวัสดุ ({po.items?.length ?? 0} รายการ)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
                <tr>
                  {["#", "รหัส", "ชื่อวัสดุ", "หน่วย", "จำนวน", "ราคา/หน่วย", "รับแล้ว", "รวม"].map((h, i) => (
                    <th key={h} className={cn(
                      "px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-muted)]",
                      i >= 4 ? "text-right" : "text-left"
                    )}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {po.items?.map((item, idx) => {
                  const lineTotal = item.quantity * item.unitPrice;
                  const receivedPct = item.quantity > 0 ? (item.receivedQty / item.quantity) * 100 : 0;
                  const fullyReceived = item.receivedQty >= item.quantity;
                  return (
                    <tr key={item.id} className="bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] transition-colors">
                      <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] font-mono">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-[var(--color-brand)]">{item.material?.code}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-text-primary)]">{item.material?.name}</td>
                      <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">{item.material?.unit}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-sm">{formatNumber(item.quantity, 2)}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-sm">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-right">
                        <div>
                          <span className={cn("text-xs font-mono tabular-nums font-bold",
                            fullyReceived ? "text-[var(--color-success)]" : "text-[var(--color-warning)]"
                          )}>
                            {formatNumber(item.receivedQty ?? 0, 2)}
                          </span>
                          <div className="w-full h-1 bg-[var(--color-surface-3)] rounded-full mt-1 min-w-[40px]">
                            <div
                              className={cn("h-1 rounded-full transition-all",
                                fullyReceived ? "bg-[var(--color-success)]" : "bg-[var(--color-warning)]"
                              )}
                              style={{ width: `${Math.min(receivedPct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold font-mono tabular-nums text-sm text-[var(--color-text-primary)]">
                        {formatCurrency(lineTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-[var(--color-border-strong)] bg-[var(--color-surface-2)]">
                <tr>
                  <td colSpan={7} className="px-4 py-3 text-right text-xs font-mono uppercase text-[var(--color-text-muted)]">
                    มูลค่ารวมทั้งสิ้น
                  </td>
                  <td className="px-4 py-3 text-right font-bold font-mono tabular-nums text-[var(--color-brand)] text-base">
                    {formatCurrency(grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Approve confirm */}
      <ConfirmDialog
        open={approveConfirm} onOpenChange={setApproveConfirm}
        title={`อนุมัติ PO ${po.poNumber}?`}
        description="เมื่ออนุมัติแล้วจะสามารถรับสินค้าได้ทันที"
        confirmLabel="อนุมัติ" variant="default"
        loading={statusMutation.isPending}
        onConfirm={handleApprove}
      />

      {/* Cancel confirm */}
      <ConfirmDialog
        open={cancelConfirm} onOpenChange={setCancelConfirm}
        title={`ยกเลิก PO ${po.poNumber}?`}
        description="การยกเลิกไม่สามารถย้อนกลับได้"
        confirmLabel="ยกเลิก PO"
        loading={statusMutation.isPending}
        onConfirm={handleCancel}
      />
    </div>
  );
}
