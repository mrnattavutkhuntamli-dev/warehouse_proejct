import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Wrench,
  RefreshCw,
  Pencil,
  Trash2,
  LogOut,
  LogIn,
  Clock,
  Tag,
} from "lucide-react";
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
import { ToolStatusBadge } from "@/components/common/ToolStatusBadge";
import { ToolForm } from "./ToolForm";
import { ToolCategoryForm } from "./ToolCategoryForm";
import { BorrowForm, ReturnForm } from "./BorrowForm";
import {
  useTools,
  useDeleteTool,
  useToolCategories,
  useDeleteToolCategory,
  useBorrowRecords,
} from "@/services/toolsService";
import { useTableParams } from "@/hooks/useTableParams";
import { formatDate } from "@/utils/formatters";
import { cn } from "@/utils/cn";

// ✅ ใช้ "ALL" แทน "" สำหรับตัวเลือก "ทุกสถานะ"
const TOOL_STATUS_OPTS = [
  { value: "ALL", label: "ทุกสถานะ" },
  { value: "AVAILABLE", label: "ว่าง" },
  { value: "BORROWED", label: "ถูกยืม" },
  { value: "MAINTENANCE", label: "ซ่อมบำรุง" },
  { value: "BROKEN", label: "ชำรุด" },
  { value: "RETIRED", label: "เลิกใช้" },
];

export default function ToolsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("tools"); // "tools" | "borrow" | "categories"
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [borrowTarget, setBorrowTarget] = useState(null);
  const [returnTarget, setReturnTarget] = useState(null);
  const [createCatOpen, setCreateCatOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [deleteCat, setDeleteCat] = useState(null);

  // Tools params
  const toolParams = useTableParams();
  const borrowParams = useTableParams({ filters: { returned: "false" } });

  const {
    data: toolData,
    isLoading,
    refetch,
  } = useTools(toolParams.queryParams);
  const {
    data: borrowData,
    isLoading: borrowLoading,
    refetch: refetchBorrow,
  } = useBorrowRecords({
    ...borrowParams.queryParams,
    returned: borrowParams.filters.returned ?? "false",
  });
  const {
    data: catData,
    isLoading: catLoading,
    refetch: refetchCat,
  } = useToolCategories();
  const deleteMutation = useDeleteTool();
  const deleteCatMutation = useDeleteToolCategory();

  const tools = toolData ?? [];
  const borrowRecs = borrowData ?? [];
  const categories = catData ?? [];

  // Active borrow count
  const activeBorrows =
    borrowData?.data?.filter((r) => !r.returnedAt).length ?? 0;

  const TOOL_COLUMNS = [
    {
      key: "code",
      header: "รหัส",
      skelWidth: "80px",
      render: (v) => (
        <span className="font-mono text-xs font-bold text-[var(--color-brand)]">
          {v}
        </span>
      ),
    },
    {
      key: "name",
      header: "ชื่อเครื่องมือ",
      skelWidth: "200px",
      render: (v, row) => (
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            {v}
          </p>
          {(row.brand || row.model) && (
            <p className="text-xs text-[var(--color-text-muted)]">
              {[row.brand, row.model].filter(Boolean).join(" · ")}
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
      key: "status",
      header: "สถานะ",
      skelWidth: "110px",
      render: (v) => <ToolStatusBadge status={v} />,
    },
    {
      key: "serialNumber",
      header: "Serial No.",
      skelWidth: "120px",
      render: (v) => (
        <span className="text-xs font-mono text-[var(--color-text-muted)]">
          {v || "—"}
        </span>
      ),
    },
    {
      key: "location",
      header: "ตำแหน่ง",
      skelWidth: "110px",
      render: (v) => (
        <span className="text-xs text-[var(--color-text-secondary)]">
          {/* ✅ แก้จาก {v} เป็น {v?.code} หรือชื่อ field ที่คุณต้องการแสดง */}
          {typeof v === "object" ? v?.code : v || "—"}
        </span>
      ),
    },
    {
      key: "_actions",
      header: "",
      skelWidth: "90px",
      render: (_, row) => (
        <div
          className="flex items-center gap-1 justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          {row.status === "AVAILABLE" && (
            <Button
              variant="ghost"
              size="icon-sm"
              title="บันทึกการยืม"
              onClick={() => setBorrowTarget(row)}
              className="text-[var(--color-warning)] hover:bg-[var(--color-warning-subtle)]"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          )}
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

  const BORROW_COLUMNS = [
    {
      key: "tool",
      header: "เครื่องมือ",
      skelWidth: "160px",
      render: (_, row) => (
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/tools/${row.tool?.id}`);
            }}
            className="text-sm font-medium text-[var(--color-brand)] hover:underline text-left"
          >
            {row.tool?.name}
          </button>
          <p className="text-xs font-mono text-[var(--color-text-muted)]">
            {row.tool?.code}
          </p>
        </div>
      ),
    },
    {
      key: "borrowerName",
      header: "ผู้ยืม",
      skelWidth: "120px",
      render: (v, row) => (
        <div>
          <p className="text-sm text-[var(--color-text-primary)]">{v}</p>
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
      skelWidth: "100px",
      render: (v, row) => {
        const overdue = !row.returnedAt && v && new Date(v) < new Date();
        return (
          <span
            className={cn(
              "text-xs font-mono",
              overdue
                ? "text-[var(--color-danger)] font-bold"
                : "text-[var(--color-text-muted)]",
            )}
          >
            {formatDate(v)}
            {overdue && " ⚠"}
          </span>
        );
      },
    },
    {
      key: "returnedAt",
      header: "สถานะ",
      skelWidth: "90px",
      render: (v) =>
        v ? (
          <Badge variant="success">คืนแล้ว</Badge>
        ) : (
          <Badge variant="pending">ยังไม่คืน</Badge>
        ),
    },
    {
      key: "_ret",
      header: "",
      skelWidth: "60px",
      render: (_, row) =>
        !row.returnedAt && (
          <Button
            variant="secondary"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              setReturnTarget(row);
            }}
          >
            <LogIn className="w-3 h-3" />
            คืน
          </Button>
        ),
    },
  ];

  const CAT_COLUMNS = [
    {
      key: "name",
      header: "ชื่อหมวดหมู่",
      skelWidth: "150px",
      render: (v) => (
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          {v}
        </span>
      ),
    },
    {
      key: "description",
      header: "คำอธิบาย",
      skelWidth: "200px",
      render: (v) => (
        <span className="text-xs text-[var(--color-text-muted)]">
          {v || "—"}
        </span>
      ),
    },
    {
      key: "_toolCount",
      header: "จำนวนเครื่องมือ",
      align: "center",
      skelWidth: "100px",
      render: (_, row) => (
        <span className="text-xs font-mono text-[var(--color-text-secondary)]">
          {row._count?.tools ?? "—"}
        </span>
      ),
    },
    {
      key: "_actions",
      header: "",
      skelWidth: "70px",
      render: (_, row) => (
        <div
          className="flex gap-1 justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setEditCat(row)}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)]"
            onClick={() => setDeleteCat(row)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const TABS = [
    { id: "tools", label: "เครื่องมือ", icon: Wrench },
    { id: "borrow", label: "ยืม-คืน", icon: Clock, count: activeBorrows },
    { id: "categories", label: "หมวดหมู่", icon: Tag },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="จัดการเครื่องมือ"
        subtitle="ติดตามสถานะ ยืม-คืนเครื่องมือและอุปกรณ์ทั้งหมด"
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                refetch();
                refetchBorrow();
                refetchCat();
              }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            {tab === "tools" && (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="w-3.5 h-3.5" />
                เพิ่มเครื่องมือ
              </Button>
            )}
            {tab === "categories" && (
              <Button size="sm" onClick={() => setCreateCatOpen(true)}>
                <Plus className="w-3.5 h-3.5" />
                เพิ่มหมวดหมู่
              </Button>
            )}
          </>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[var(--color-surface-2)] rounded-lg p-1 w-fit border border-[var(--color-border)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              tab === t.id
                ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
            )}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.count > 0 && (
              <span className="bg-[var(--color-warning)] text-white text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full leading-none">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters — Tools tab */}
      {tab === "tools" && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] max-w-xs">
            <Input
              placeholder="ค้นหาเครื่องมือ..."
              prefix={<Search className="w-3.5 h-3.5" />}
              value={toolParams.search}
              onChange={(e) => toolParams.handleSearch(e.target.value)}
            />
          </div>
          <div className="w-40">
            {/* ✅ value="ALL" แทน "" / แปลงกลับใน onValueChange */}
            <Select
              value={toolParams.filters.status ?? "ALL"}
              onValueChange={(v) =>
                toolParams.handleFilter("status", v === "ALL" ? null : v)
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  <SelectValue placeholder="สถานะ" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {TOOL_STATUS_OPTS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-44">
            {/* ✅ value="ALL" แทน "" / แปลงกลับใน onValueChange */}
            <Select
              value={toolParams.filters.categoryId ?? "ALL"}
              onValueChange={(v) =>
                toolParams.handleFilter("categoryId", v === "ALL" ? null : v)
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="หมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
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
        </div>
      )}

      {/* Filters — Borrow tab */}
      {tab === "borrow" && (
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-xs">
            <Input
              placeholder="ค้นหาชื่อผู้ยืม..."
              prefix={<Search className="w-3.5 h-3.5" />}
              value={borrowParams.search}
              onChange={(e) => borrowParams.handleSearch(e.target.value)}
            />
          </div>
          <div className="w-36">
            {/* ✅ "ทั้งหมด" ใช้ value="ALL" แทน "" */}
            <Select
              value={borrowParams.filters.returned ?? "false"}
              onValueChange={(v) =>
                borrowParams.handleFilter("returned", v === "ALL" ? "" : v)
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">ยังไม่คืน</SelectItem>
                <SelectItem value="true">คืนแล้ว</SelectItem>
                <SelectItem value="ALL">ทั้งหมด</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Tables */}
      {tab === "tools" && (
        <DataTable
          columns={TOOL_COLUMNS}
          data={tools}
          pagination={toolData?.pagination}
          onPageChange={toolParams.setPage}
          loading={isLoading}
          emptyMessage="ยังไม่มีเครื่องมือ"
          onRowClick={(row) => navigate(`/tools/${row.id}`)}
        />
      )}
      {tab === "borrow" && (
        <DataTable
          columns={BORROW_COLUMNS}
          data={borrowRecs}
          pagination={borrowData?.pagination}
          onPageChange={borrowParams.setPage}
          loading={borrowLoading}
          emptyMessage="ไม่มีรายการยืม"
        />
      )}
      {tab === "categories" && (
        <DataTable
          columns={CAT_COLUMNS}
          data={categories}
          loading={catLoading}
          emptyMessage="ยังไม่มีหมวดหมู่"
        />
      )}

      {/* ── Tool modals ── */}
      <FormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="เพิ่มเครื่องมือใหม่"
        size="lg"
      >
        <ToolForm
          onSuccess={() => setCreateOpen(false)}
          onCancel={() => setCreateOpen(false)}
        />
      </FormModal>
      <FormModal
        open={Boolean(editTarget)}
        onOpenChange={(o) => !o && setEditTarget(null)}
        title="แก้ไขเครื่องมือ"
        description={editTarget?.name}
        size="lg"
      >
        <ToolForm
          defaultValues={editTarget}
          onSuccess={() => setEditTarget(null)}
          onCancel={() => setEditTarget(null)}
        />
      </FormModal>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`ปิดใช้งาน "${deleteTarget?.name}"?`}
        description="เครื่องมือจะถูกซ่อนจากระบบ ไม่สามารถยืมได้อีก"
        confirmLabel="ปิดใช้งาน"
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />

      {/* ── Borrow/Return modals ── */}
      <FormModal
        open={Boolean(borrowTarget)}
        onOpenChange={(o) => !o && setBorrowTarget(null)}
        title="บันทึกการยืมเครื่องมือ"
        size="md"
      >
        <BorrowForm
          toolId={borrowTarget?.id}
          toolName={borrowTarget?.name}
          onSuccess={() => setBorrowTarget(null)}
          onCancel={() => setBorrowTarget(null)}
        />
      </FormModal>
      <FormModal
        open={Boolean(returnTarget)}
        onOpenChange={(o) => !o && setReturnTarget(null)}
        title="บันทึกการคืนเครื่องมือ"
        size="md"
      >
        <ReturnForm
          record={returnTarget}
          onSuccess={() => setReturnTarget(null)}
          onCancel={() => setReturnTarget(null)}
        />
      </FormModal>

      {/* ── Category modals ── */}
      <FormModal
        open={createCatOpen}
        onOpenChange={setCreateCatOpen}
        title="เพิ่มหมวดหมู่เครื่องมือ"
        size="sm"
      >
        <ToolCategoryForm
          onSuccess={() => setCreateCatOpen(false)}
          onCancel={() => setCreateCatOpen(false)}
        />
      </FormModal>
      <FormModal
        open={Boolean(editCat)}
        onOpenChange={(o) => !o && setEditCat(null)}
        title="แก้ไขหมวดหมู่"
        description={editCat?.name}
        size="sm"
      >
        <ToolCategoryForm
          defaultValues={editCat}
          onSuccess={() => setEditCat(null)}
          onCancel={() => setEditCat(null)}
        />
      </FormModal>
      <ConfirmDialog
        open={Boolean(deleteCat)}
        onOpenChange={(o) => !o && setDeleteCat(null)}
        title={`ลบหมวดหมู่ "${deleteCat?.name}"?`}
        description="เครื่องมือในหมวดหมู่นี้จะไม่ถูกลบ แต่ต้องกำหนดหมวดหมู่ใหม่"
        confirmLabel="ลบ"
        loading={deleteCatMutation.isPending}
        onConfirm={async () => {
          await deleteCatMutation.mutateAsync(deleteCat.id);
          setDeleteDept(null);
        }}
      />
    </div>
  );
}
