import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, CheckCircle2, XCircle,
  Send, FileDown, User, Building2, ClipboardList,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusFlow } from "@/components/common/StatusFlow";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useMaterialIssue, useUpdateIssueStatus } from "@/services/procurementService";
import { usePdfDownload } from "@/hooks/usePdfDownload";
import { formatDate, formatNumber, getStatusLabel } from "@/utils/formatters";
import { cn } from "@/utils/cn";

const ISSUE_STEPS = [
  { key: "DRAFT",     label: "ร่าง" },
  { key: "APPROVED",  label: "อนุมัติ" },
  { key: "ISSUED",    label: "จ่ายแล้ว" },
];

export default function IssueDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [approveConfirm, setApproveConfirm] = useState(false);
  const [issueConfirm,   setIssueConfirm]   = useState(false);
  const [cancelConfirm,  setCancelConfirm]  = useState(false);

  const { data: issue, isLoading, refetch } = useMaterialIssue(id);
  const statusMutation = useUpdateIssueStatus(id);
  const { downloadIssue, isDownloading } = usePdfDownload();

  const handleStatus = async (status) => {
    await statusMutation.mutateAsync({ status });
    setApproveConfirm(false);
    setIssueConfirm(false);
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

  if (!issue) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
      <p className="text-[var(--color-text-muted)]">ไม่พบใบเบิกวัสดุนี้</p>
      <Button variant="outline" size="sm" onClick={() => navigate("/procurement/issues")}>
        <ArrowLeft className="w-4 h-4" /> กลับ
      </Button>
    </div>
  );

  const isDraft     = issue.status === "DRAFT";
  const isApproved  = issue.status === "APPROVED";
  const isCancelled = issue.status === "CANCELLED";
  const isIssued    = issue.status === "ISSUED";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        breadcrumb={
          <span className="flex items-center gap-1">
            <Link to="/procurement/issues" className="hover:text-[var(--color-text-primary)] transition-colors">ใบเบิกวัสดุ</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="font-mono text-[var(--color-info)]">{issue.issueNumber}</span>
          </span>
        }
        title={issue.issueNumber}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => navigate("/procurement/issues")}>
              <ArrowLeft className="w-3.5 h-3.5" />กลับ
            </Button>
            <Button variant="outline" size="sm" loading={isDownloading} onClick={() => downloadIssue(id)}>
              <FileDown className="w-3.5 h-3.5" />PDF
            </Button>
            {isDraft && (
              <Button variant="ghost-destructive" size="sm" onClick={() => setCancelConfirm(true)}>
                <XCircle className="w-3.5 h-3.5" />ยกเลิก
              </Button>
            )}
            {isDraft && (
              <Button variant="secondary" size="sm" onClick={() => setApproveConfirm(true)}>
                <CheckCircle2 className="w-3.5 h-3.5" />อนุมัติ
              </Button>
            )}
            {isApproved && (
              <Button size="sm" onClick={() => setIssueConfirm(true)}>
                <Send className="w-3.5 h-3.5" />จ่ายวัสดุ
              </Button>
            )}
          </div>
        }
      />

      {/* Status flow */}
      {!isCancelled ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-6 py-5">
          <StatusFlow steps={ISSUE_STEPS} current={issue.status} />
        </div>
      ) : (
        <div className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[var(--color-danger-subtle)] border border-[var(--color-danger)]">
          <XCircle className="w-4 h-4 text-[var(--color-danger)]" />
          <span className="text-sm font-semibold text-[var(--color-danger)]">ใบเบิกนี้ถูกยกเลิกแล้ว</span>
        </div>
      )}

      {isIssued && (
        <div className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[var(--color-success-subtle)] border border-[var(--color-success)]/40">
          <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
          <span className="text-sm font-semibold text-[var(--color-success)]">
            จ่ายวัสดุแล้ว — สต็อกถูกหักเมื่อ {formatDate(issue.issuedAt ?? issue.updatedAt)}
          </span>
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-4 h-4 text-[var(--color-brand)]" />ผู้ขอเบิก</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              {issue.requester?.name ?? issue.createdBy?.name ?? "—"}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {issue.department?.name ?? issue.requester?.department?.name ?? "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="w-4 h-4 text-[var(--color-brand)]" />วัตถุประสงค์</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
              {issue.purpose ?? "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>ผู้เกี่ยวข้อง</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div>
              <p className="text-[10px] font-mono uppercase text-[var(--color-text-muted)]">ผู้สร้าง</p>
              <p className="text-sm">{issue.createdBy?.name ?? "—"}</p>
            </div>
            {issue.approvedBy && (
              <div>
                <p className="text-[10px] font-mono uppercase text-[var(--color-text-muted)]">ผู้อนุมัติ</p>
                <p className="text-sm">{issue.approvedBy.name}</p>
              </div>
            )}
            {issue.issuedBy && (
              <div>
                <p className="text-[10px] font-mono uppercase text-[var(--color-text-muted)]">ผู้จ่าย</p>
                <p className="text-sm">{issue.issuedBy.name}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการวัสดุที่เบิก ({issue.items?.length ?? 0} รายการ)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
                <tr>
                  {["#", "รหัส", "ชื่อวัสดุ", "หน่วย", "จำนวนที่ขอ"].map((h, i) => (
                    <th key={h} className={cn(
                      "px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-muted)]",
                      i >= 4 ? "text-right" : "text-left"
                    )}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {issue.items?.map((item, idx) => (
                  <tr key={item.id} className="bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] transition-colors">
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] font-mono">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-[var(--color-brand)]">{item.material?.code}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-primary)]">{item.material?.name}</td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">{item.material?.unit}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn(
                        "text-sm font-bold tabular-nums font-mono",
                        isIssued ? "text-[var(--color-danger)]" : "text-[var(--color-text-primary)]"
                      )}>
                        {isIssued ? "−" : ""}{formatNumber(item.quantity, 2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={approveConfirm} onOpenChange={setApproveConfirm}
        title={`อนุมัติใบเบิก ${issue.issueNumber}?`}
        description="เมื่ออนุมัติแล้ว สามารถกด 'จ่ายวัสดุ' เพื่อหักสต็อกได้ทันที"
        confirmLabel="อนุมัติ" variant="default"
        loading={statusMutation.isPending}
        onConfirm={() => handleStatus("APPROVED")}
      />
      <ConfirmDialog
        open={issueConfirm} onOpenChange={setIssueConfirm}
        title={`จ่ายวัสดุตามใบเบิก ${issue.issueNumber}?`}
        description="สต็อกวัสดุทุกรายการจะถูกหักออกทันที ไม่สามารถย้อนกลับได้"
        confirmLabel="ยืนยันจ่ายวัสดุ" variant="default"
        loading={statusMutation.isPending}
        onConfirm={() => handleStatus("ISSUED")}
      />
      <ConfirmDialog
        open={cancelConfirm} onOpenChange={setCancelConfirm}
        title={`ยกเลิกใบเบิก ${issue.issueNumber}?`}
        description="การยกเลิกไม่สามารถย้อนกลับได้"
        confirmLabel="ยกเลิกใบเบิก"
        loading={statusMutation.isPending}
        onConfirm={() => handleStatus("CANCELLED")}
      />
    </div>
  );
}
