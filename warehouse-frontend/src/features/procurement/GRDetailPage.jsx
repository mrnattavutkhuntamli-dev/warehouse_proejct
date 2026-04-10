import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, FileDown, Truck, Building2, User, MapPin } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGoodsReceipt } from "@/services/procurementService";
import { usePdfDownload } from "@/hooks/usePdfDownload";
import { formatDate, formatCurrency, formatNumber } from "@/utils/formatters";
import { cn } from "@/utils/cn";

export default function GRDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: gr, isLoading } = useGoodsReceipt(id);
  const { downloadGR, isDownloading } = usePdfDownload();

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in">
      <div className="skeleton h-8 w-64 rounded" />
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-lg" />)}
      </div>
      <div className="skeleton h-48 rounded-lg" />
    </div>
  );

  if (!gr) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
      <p className="text-[var(--color-text-muted)]">ไม่พบ Goods Receipt นี้</p>
      <Button variant="outline" size="sm" onClick={() => navigate("/procurement/gr")}>
        <ArrowLeft className="w-4 h-4" /> กลับ
      </Button>
    </div>
  );

  const grandTotal = gr.items?.reduce((s, i) => s + (i.quantity * i.unitPrice), 0) ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        breadcrumb={
          <span className="flex items-center gap-1">
            <Link to="/procurement/gr" className="hover:text-[var(--color-text-primary)] transition-colors">รับสินค้า</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="font-mono text-[var(--color-success)]">{gr.grNumber}</span>
          </span>
        }
        title={gr.grNumber}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/procurement/gr")}>
              <ArrowLeft className="w-3.5 h-3.5" />กลับ
            </Button>
            <Button variant="outline" size="sm" loading={isDownloading} onClick={() => downloadGR(id)}>
              <FileDown className="w-3.5 h-3.5" />PDF
            </Button>
          </div>
        }
      />

      {/* Received banner */}
      <div className="flex items-center gap-3 px-5 py-3 rounded-lg bg-[var(--color-success-subtle)] border border-[var(--color-success)]/30">
        <Truck className="w-4 h-4 text-[var(--color-success)]" />
        <span className="text-sm font-semibold text-[var(--color-success)]">
          รับสินค้าเข้าคลังแล้ว — สต็อกถูกอัปเดตเมื่อ {formatDate(gr.createdAt)}
        </span>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="w-4 h-4 text-[var(--color-brand)]" />ผู้จำหน่าย</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            <p className="font-mono text-xs text-[var(--color-brand)]">{gr.supplier?.code}</p>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{gr.supplier?.name}</p>
            {gr.supplier?.phone && <p className="text-xs text-[var(--color-text-muted)]">📞 {gr.supplier.phone}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-4 h-4 text-[var(--color-brand)]" />ข้อมูลการรับ</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-[10px] font-mono uppercase text-[var(--color-text-muted)]">ผู้รับสินค้า</p>
              <p className="text-sm text-[var(--color-text-primary)]">{gr.receivedBy?.name ?? "—"}</p>
            </div>
            {gr.purchaseOrder && (
              <div>
                <p className="text-[10px] font-mono uppercase text-[var(--color-text-muted)]">อ้างอิง PO</p>
                <Link
                  to={`/procurement/po/${gr.purchaseOrder.id}`}
                  className="text-sm font-mono text-[var(--color-brand)] hover:underline"
                >
                  {gr.purchaseOrder.poNumber}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>มูลค่ารวม</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono tabular-nums text-[var(--color-success)]">
              {formatCurrency(grandTotal)}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">{gr.items?.length ?? 0} รายการ</p>
            {gr.note && <p className="text-xs text-[var(--color-text-secondary)] mt-3 border-t border-[var(--color-border)] pt-2">{gr.note}</p>}
          </CardContent>
        </Card>
      </div>

      {/* Items table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการวัสดุที่รับ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
                <tr>
                  {["#", "รหัส", "ชื่อวัสดุ", "จำนวน", "ราคา/หน่วย", "Location", "รวม"].map((h, i) => (
                    <th key={h} className={cn(
                      "px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-muted)]",
                      i >= 3 && i <= 4 ? "text-right" : i === 6 ? "text-right" : "text-left"
                    )}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {gr.items?.map((item, idx) => (
                  <tr key={item.id} className="bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] transition-colors">
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] font-mono">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-[var(--color-brand)]">{item.material?.code}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-primary)]">{item.material?.name}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-sm font-bold text-[var(--color-success)]">
                      +{formatNumber(item.quantity, 2)} {item.material?.unit}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-sm">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-4 py-3">
                      {item.location ? (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-[var(--color-text-muted)]" />
                          <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                            {item.location.code}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--color-text-muted)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold font-mono tabular-nums text-sm">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-[var(--color-border-strong)] bg-[var(--color-surface-2)]">
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-right text-xs font-mono uppercase text-[var(--color-text-muted)]">
                    มูลค่ารวม
                  </td>
                  <td className="px-4 py-3 text-right font-bold font-mono tabular-nums text-[var(--color-success)] text-base">
                    {formatCurrency(grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
