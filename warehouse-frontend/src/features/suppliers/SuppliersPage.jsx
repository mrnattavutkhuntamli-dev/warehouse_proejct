import { useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Building2,
  Phone,
  Mail,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { FormModal } from "@/components/common/FormModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { SupplierForm } from "./SupplierForm";
import { useSuppliers, useDeleteSupplier } from "@/services/suppliersService";
import { useTableParams } from "@/hooks/useTableParams";
import { cn } from "@/utils/cn";

export default function SuppliersPage() {
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [view, setView] = useState("table"); // "table" | "grid"

  const { queryParams, setPage, handleSearch, search } = useTableParams();
  const { data, isLoading, refetch } = useSuppliers(queryParams);
  const deleteMutation = useDeleteSupplier();

  const suppliers = data ?? [];

  const TABLE_COLUMNS = [
    {
      key: "code",
      header: "รหัส",
      mono: true,
      skelWidth: "80px",
      render: (v) => (
        <span className="font-mono text-xs font-bold text-[var(--color-brand)]">
          {v}
        </span>
      ),
    },
    {
      key: "name",
      header: "ชื่อบริษัท / ผู้จำหน่าย",
      skelWidth: "200px",
      render: (v, row) => (
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            {v}
          </p>
          {row.taxId && (
            <p className="text-xs font-mono text-[var(--color-text-muted)]">
              TAX: {row.taxId}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "contactName",
      header: "ผู้ติดต่อ",
      skelWidth: "130px",
      render: (v) => (
        <span className="text-sm text-[var(--color-text-secondary)]">
          {v || "—"}
        </span>
      ),
    },
    {
      key: "phone",
      header: "โทร",
      skelWidth: "110px",
      render: (v) =>
        v ? (
          <a
            href={`tel:${v}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-mono text-[var(--color-brand)] hover:underline flex items-center gap-1"
          >
            <Phone className="w-3 h-3" />
            {v}
          </a>
        ) : (
          <span className="text-xs text-[var(--color-text-muted)]">—</span>
        ),
    },
    {
      key: "email",
      header: "อีเมล",
      skelWidth: "150px",
      render: (v) =>
        v ? (
          <a
            href={`mailto:${v}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-[var(--color-text-secondary)] hover:underline flex items-center gap-1 truncate max-w-[160px]"
          >
            <Mail className="w-3 h-3 shrink-0" />
            {v}
          </a>
        ) : (
          <span className="text-xs text-[var(--color-text-muted)]">—</span>
        ),
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
      key: "_actions",
      header: "",
      skelWidth: "70px",
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
        title="ผู้จำหน่าย"
        subtitle="จัดการรายชื่อผู้จำหน่ายและซัพพลายเออร์ทั้งหมด"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            {/* view toggle */}
            <div className="flex items-center bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md p-0.5">
              {[
                { id: "table", icon: <FileText className="w-3.5 h-3.5" /> },
                { id: "grid", icon: <Building2 className="w-3.5 h-3.5" /> },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  className={cn(
                    "px-2.5 py-1.5 rounded transition-all",
                    view === v.id
                      ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
                  )}
                >
                  {v.icon}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              เพิ่มผู้จำหน่าย
            </Button>
          </>
        }
      />

      {/* Search */}
      <div className="max-w-xs">
        <Input
          placeholder="ค้นหาชื่อ, รหัส..."
          prefix={<Search className="w-3.5 h-3.5" />}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Table view */}
      {view === "table" && (
        <DataTable
          columns={TABLE_COLUMNS}
          data={suppliers}
          pagination={data?.pagination}
          onPageChange={setPage}
          loading={isLoading}
          emptyMessage="ยังไม่มีผู้จำหน่าย"
          onRowClick={(row) => setEditTarget(row)}
        />
      )}

      {/* Grid / Card view */}
      {view === "grid" &&
        (isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton h-40 rounded-lg" />
            ))}
          </div>
        ) : suppliers.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 className="w-10 h-10 mx-auto mb-3 text-[var(--color-text-muted)] opacity-20" />
            <p className="text-sm text-[var(--color-text-muted)]">
              ยังไม่มีผู้จำหน่าย
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((s) => (
              <div
                key={s.id}
                className="group p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand)] hover:shadow-[var(--shadow-glow)] transition-all duration-200 cursor-pointer"
                onClick={() => setEditTarget(s)}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-[var(--color-brand-subtle)] text-[var(--color-brand)]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <Badge variant={s.isActive ? "success" : "cancelled"}>
                    {s.isActive ? "ใช้งาน" : "ปิด"}
                  </Badge>
                </div>

                {/* Name */}
                <p className="font-mono text-xs text-[var(--color-brand)] mb-0.5">
                  {s.code}
                </p>
                <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1 line-clamp-2 leading-snug">
                  {s.name}
                </p>
                {s.taxId && (
                  <p className="text-xs font-mono text-[var(--color-text-muted)] mb-3">
                    TAX: {s.taxId}
                  </p>
                )}

                {/* Contact */}
                <div className="space-y-1 border-t border-[var(--color-border)] pt-3">
                  {s.contactName && (
                    <p className="text-xs text-[var(--color-text-secondary)] truncate">
                      👤 {s.contactName}
                    </p>
                  )}
                  {s.phone && (
                    <p className="text-xs font-mono text-[var(--color-text-secondary)] flex items-center gap-1">
                      <Phone className="w-3 h-3 shrink-0" />
                      {s.phone}
                    </p>
                  )}
                  {s.email && (
                    <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 shrink-0" />
                      {s.email}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div
                  className="flex gap-1 justify-end mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setEditTarget(s)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)]"
                    onClick={() => setDeleteTarget(s)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ))}

      {/* Modals */}
      <FormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="เพิ่มผู้จำหน่ายใหม่"
        size="md"
      >
        <SupplierForm
          onSuccess={() => setCreateOpen(false)}
          onCancel={() => setCreateOpen(false)}
        />
      </FormModal>

      <FormModal
        open={Boolean(editTarget)}
        onOpenChange={(o) => !o && setEditTarget(null)}
        title="แก้ไขข้อมูลผู้จำหน่าย"
        description={editTarget?.name}
        size="md"
      >
        <SupplierForm
          defaultValues={editTarget}
          onSuccess={() => setEditTarget(null)}
          onCancel={() => setEditTarget(null)}
        />
      </FormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`ปิดใช้งาน "${deleteTarget?.name}"?`}
        description="ผู้จำหน่ายจะไม่ถูกแสดงในรายการสั่งซื้อ"
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
