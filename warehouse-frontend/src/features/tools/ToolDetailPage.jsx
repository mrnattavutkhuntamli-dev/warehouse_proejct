import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  Pencil,
  RefreshCw,
  LogOut,
  LogIn,
  Wrench,
  Tag,
  MapPin,
  Hash,
  Building,
  CalendarDays,
  ClipboardList,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/common/DataTable";
import { FormModal } from "@/components/common/FormModal";
import { ToolStatusBadge } from "@/components/common/ToolStatusBadge";
import { ToolForm } from "./ToolForm";
import { BorrowForm, ReturnForm } from "./BorrowForm";
import { useTool, useBorrowRecords } from "@/services/toolsService";
import { formatDate, formatDateTime } from "@/utils/formatters";
import { cn } from "@/utils/cn";

const CONDITION_CONFIG = {
  GOOD: { label: "สภาพดี", cls: "text-[var(--color-success)]" },
  FAIR: { label: "พอใช้", cls: "text-[var(--color-warning)]" },
  POOR: { label: "สภาพแย่", cls: "text-[var(--color-danger)]" },
};

const HISTORY_COLUMNS = [
  {
    key: "borrowerName",
    header: "ผู้ยืม",
    skelWidth: "120px",
    render: (v, row) => (
      <div>
        <p className="text-sm font-medium text-[var(--color-text-primary)]">
          {v}
        </p>
        {row.borrowerDept && (
          <p className="text-xs text-[var(--color-text-muted)]">
            {row.borrowerDept}
          </p>
        )}
      </div>
    ),
  },
  {
    key: "purpose",
    header: "วัตถุประสงค์",
    skelWidth: "150px",
    render: (v) => (
      <span className="text-xs text-[var(--color-text-secondary)] line-clamp-1">
        {v || "—"}
      </span>
    ),
  },
  {
    key: "borrowedAt",
    header: "ยืมเมื่อ",
    skelWidth: "90px",
    render: (v) => (
      <span className="text-xs font-mono text-[var(--color-text-muted)]">
        {formatDate(v)}
      </span>
    ),
  },
  {
    key: "expectedReturn",
    header: "กำหนดคืน",
    skelWidth: "90px",
    render: (v, row) => {
      const isOverdue = !row.returnedAt && v && new Date(v) < new Date();
      return (
        <span
          className={cn(
            "text-xs font-mono",
            isOverdue
              ? "text-[var(--color-danger)] font-bold"
              : "text-[var(--color-text-muted)]",
          )}
        >
          {formatDate(v)}
          {isOverdue && " ⚠"}
        </span>
      );
    },
  },
  {
    key: "returnedAt",
    header: "คืนเมื่อ",
    skelWidth: "90px",
    render: (v) =>
      v ? (
        <span className="text-xs font-mono text-[var(--color-success)]">
          {formatDate(v)}
        </span>
      ) : (
        <Badge variant="pending" className="text-xs">
          ยังไม่คืน
        </Badge>
      ),
  },
  {
    key: "returnCondition",
    header: "สภาพตอนคืน",
    skelWidth: "90px",
    render: (v) => {
      const cfg = CONDITION_CONFIG[v];
      return cfg ? (
        <span className={cn("text-xs font-semibold", cfg.cls)}>
          {cfg.label}
        </span>
      ) : (
        <span className="text-xs text-[var(--color-text-muted)]">—</span>
      );
    },
  },
];

export default function ToolDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [borrowOpen, setBorrowOpen] = useState(false);
  const [returnRecord, setReturnRecord] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);

  const { data: tool, isLoading, refetch } = useTool(id);
  const { data: borrowData, isLoading: borrowLoading } = useBorrowRecords({
    toolId: id,
    page: historyPage,
    limit: 10,
  });

  // Active (not returned) borrow record for this tool
  const activeRecord = borrowData?.data?.find((r) => !r.returnedAt) ?? null;

  if (isLoading)
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="skeleton h-8 w-64 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-28 rounded-lg" />
          ))}
        </div>
        <div className="skeleton h-48 rounded-lg" />
      </div>
    );

  if (!tool)
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <Wrench className="w-12 h-12 text-[var(--color-text-muted)] opacity-20" />
        <p className="text-[var(--color-text-muted)]">ไม่พบเครื่องมือนี้</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/tools")}>
          <ArrowLeft className="w-4 h-4" /> กลับ
        </Button>
      </div>
    );

  const condCfg = CONDITION_CONFIG[tool.condition];
  const isBorrowed = tool.status === "BORROWED";

  // Total borrow count

  const totalBorrows = borrowData?.pagination?.total ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        breadcrumb={
          <span className="flex items-center gap-1 text-xs">
            <Link
              to="/tools"
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              เครื่องมือ
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="font-mono text-[var(--color-brand)]">
              {tool.code}
            </span>
          </span>
        }
        title={tool.name}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/tools")}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              กลับ
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="w-3.5 h-3.5" />
              แก้ไข
            </Button>
            {isBorrowed && activeRecord && (
              <Button size="sm" onClick={() => setReturnRecord(activeRecord)}>
                <LogIn className="w-3.5 h-3.5" />
                บันทึกการคืน
              </Button>
            )}
            {tool.status === "AVAILABLE" && (
              <Button size="sm" onClick={() => setBorrowOpen(true)}>
                <LogOut className="w-3.5 h-3.5" />
                ยืมเครื่องมือ
              </Button>
            )}
          </div>
        }
      />

      {/* Status strip */}
      <div
        className={cn(
          "flex items-center gap-3 px-5 py-3 rounded-lg border",
          isBorrowed
            ? "bg-[var(--color-warning-subtle)] border-[var(--color-warning)]/30"
            : tool.status === "BROKEN"
              ? "bg-[var(--color-danger-subtle)] border-[var(--color-danger)]/30"
              : tool.status === "MAINTENANCE"
                ? "bg-[var(--color-info-subtle)] border-[var(--color-info)]/30"
                : "bg-[var(--color-success-subtle)] border-[var(--color-success)]/30",
        )}
      >
        <ToolStatusBadge status={tool.status} />
        {isBorrowed && activeRecord && (
          <span className="text-sm text-[var(--color-warning)]">
            ยืมโดย <strong>{activeRecord.borrowerName}</strong>
            {activeRecord.borrowerDept && ` (${activeRecord.borrowerDept})`}
            {" · "}กำหนดคืน{" "}
            <strong>{formatDate(activeRecord.expectedReturn)}</strong>
          </span>
        )}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-3 text-[var(--color-text-muted)]">
              <Tag className="w-4 h-4 text-[var(--color-brand)]" />
              <p className="text-[10px] font-mono uppercase tracking-widest">
                หมวดหมู่
              </p>
            </div>
            <Badge variant="default" className="text-sm px-3 py-1">
              {tool.category?.name ?? "—"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-2 text-[var(--color-text-muted)]">
              <Building className="w-4 h-4 text-[var(--color-brand)]" />
              <p className="text-[10px] font-mono uppercase tracking-widest">
                ยี่ห้อ / รุ่น
              </p>
            </div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              {tool.brand || "—"}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {tool.model || ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-2 text-[var(--color-text-muted)]">
              <Hash className="w-4 h-4 text-[var(--color-brand)]" />
              <p className="text-[10px] font-mono uppercase tracking-widest">
                Serial No.
              </p>
            </div>
            <p className="text-sm font-mono text-[var(--color-text-primary)]">
              {tool.serialNumber || "—"}
            </p>
            {condCfg && (
              <p className={cn("text-xs mt-1.5 font-semibold", condCfg.cls)}>
                สภาพ: {condCfg.label}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-2 text-[var(--color-text-muted)]">
              <ClipboardList className="w-4 h-4 text-[var(--color-brand)]" />
              <p className="text-[10px] font-mono uppercase tracking-widest">
                สถิติการยืม
              </p>
            </div>
            <p className="text-2xl font-bold tabular-nums text-[var(--color-text-primary)]">
              {totalBorrows}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              ครั้งทั้งหมด
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Location + description */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tool.location && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
            <MapPin className="w-4 h-4 text-[var(--color-brand)] shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-muted)] mb-1">
                ตำแหน่งจัดเก็บ
              </p>
              <p className="text-sm text-[var(--color-text-primary)]">
                {/* ✅ แก้จาก {tool.location} เป็นการระบุ field .code หรือ .description */}
                {typeof tool.location === "object"
                  ? `${tool.location.code} - ${tool.location.description}`
                  : tool.location}
              </p>
            </div>
          </div>
        )}
        {tool.description && (
          <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-muted)] mb-1">
              คำอธิบาย
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {tool.description}
            </p>
          </div>
        )}
      </div>

      {/* Borrow history */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[var(--color-brand)]" />
            <CardTitle>ประวัติการยืม-คืน</CardTitle>
            <span className="text-xs text-[var(--color-text-muted)] font-mono ml-auto">
              {totalBorrows} ครั้ง
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={HISTORY_COLUMNS}
            data={borrowData ?? []}
            pagination={borrowData?.pagination}
            onPageChange={setHistoryPage}
            loading={borrowLoading}
            emptyMessage="ยังไม่มีประวัติการยืม"
          />
        </CardContent>
      </Card>

      {/* Edit modal */}
      <FormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        title="แก้ไขเครื่องมือ"
        description={tool.name}
        size="lg"
      >
        <ToolForm
          defaultValues={tool}
          onSuccess={() => {
            setEditOpen(false);
            refetch();
          }}
          onCancel={() => setEditOpen(false)}
        />
      </FormModal>

      {/* Borrow modal */}
      <FormModal
        open={borrowOpen}
        onOpenChange={setBorrowOpen}
        title="บันทึกการยืมเครื่องมือ"
        size="md"
      >
        <BorrowForm
          toolId={tool.id}
          toolName={tool.name}
          onSuccess={() => {
            setBorrowOpen(false);
            refetch();
          }}
          onCancel={() => setBorrowOpen(false)}
        />
      </FormModal>

      {/* Return modal */}
      <FormModal
        open={Boolean(returnRecord)}
        onOpenChange={(o) => !o && setReturnRecord(null)}
        title="บันทึกการคืนเครื่องมือ"
        size="md"
      >
        <ReturnForm
          record={returnRecord}
          onSuccess={() => {
            setReturnRecord(null);
            refetch();
          }}
          onCancel={() => setReturnRecord(null)}
        />
      </FormModal>
    </div>
  );
}
