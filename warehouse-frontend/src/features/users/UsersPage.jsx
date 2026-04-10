import { useState } from "react";
import {
  Plus, Search, Pencil, Trash2, RefreshCw,
  Users, Building2, Shield, UserCheck,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { FormModal } from "@/components/common/FormModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { UserForm } from "./UserForm";
import { DepartmentForm } from "./DepartmentForm";
import {
  useUsers, useDeleteUser,
  useDepartments, useDeleteDepartment,
} from "@/services/usersService";
import { useTableParams } from "@/hooks/useTableParams";
import { formatDate } from "@/utils/formatters";
import { cn } from "@/utils/cn";

const ROLE_CONFIG = {
  ADMIN:   { label: "Admin",   cls: "bg-[var(--color-danger-subtle)] text-[var(--color-danger)]" },
  MANAGER: { label: "Manager", cls: "bg-[var(--color-info-subtle)] text-[var(--color-info)]" },
  STAFF:   { label: "Staff",   cls: "bg-[var(--color-success-subtle)] text-[var(--color-success)]" },
  VIEWER:  { label: "Viewer",  cls: "bg-[var(--color-surface-3)] text-[var(--color-text-muted)]" },
};

export default function UsersPage() {
  const [tab, setTab] = useState("users"); // "users" | "departments"
  const [createOpen,  setCreateOpen]  = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [deleteTarget,setDeleteTarget]= useState(null);
  const [createDept,  setCreateDept]  = useState(false);
  const [editDept,    setEditDept]    = useState(null);
  const [deleteDept,  setDeleteDept]  = useState(null);

  const userParams = useTableParams();
  const { data: usersData, isLoading, refetch } = useUsers({
    ...userParams.queryParams,
    ...(userParams.filters.role ? { role: userParams.filters.role } : {}),
  });
  const { data: deptData, isLoading: deptLoading, refetch: refetchDepts } = useDepartments();
  const deleteUserMutation = useDeleteUser();
  const deleteDeptMutation = useDeleteDepartment();
  const users = usersData?.data ?? [];
  const depts = deptData?.data  ?? [];


  const USER_COLUMNS = [
    {
      key: "employeeCode", header: "รหัสพนักงาน", skelWidth: "80px",
      render: (v) => <span className="font-mono text-xs font-bold text-[var(--color-brand)]">{v}</span>,
    },
    {
      key: "name", header: "ชื่อ-นามสกุล", skelWidth: "160px",
      render: (v, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[var(--color-brand-subtle)] flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-[var(--color-brand)]">
              {v?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">{v}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role", header: "สิทธิ์", skelWidth: "80px",
      render: (v) => {
        const cfg = ROLE_CONFIG[v] ?? ROLE_CONFIG.VIEWER;
        return (
          <span className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold font-mono",
            cfg.cls
          )}>
            <Shield className="w-3 h-3" />{cfg.label}
          </span>
        );
      },
    },
    {
      key: "department", header: "แผนก", skelWidth: "110px",
      render: (_, row) => (
        <span className="text-xs text-[var(--color-text-secondary)]">
          {row.department?.name ?? "—"}
        </span>
      ),
    },
    {
      key: "phone", header: "โทร", skelWidth: "110px",
      render: (v) => (
        <span className="text-xs font-mono text-[var(--color-text-muted)]">{v || "—"}</span>
      ),
    },
    {
      key: "isActive", header: "สถานะ", skelWidth: "60px",
      render: (v) => (
        <Badge variant={v !== false ? "success" : "cancelled"}>{v !== false ? "ใช้งาน" : "ปิด"}</Badge>
      ),
    },
    {
      key: "createdAt", header: "สร้างเมื่อ", skelWidth: "90px",
      render: (v) => (
        <span className="text-xs font-mono text-[var(--color-text-muted)]">{formatDate(v)}</span>
      ),
    },
    {
      key: "_actions", header: "", skelWidth: "70px",
      render: (_, row) => (
        <div className="flex items-center gap-1 justify-end" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="icon-sm" onClick={() => setEditTarget(row)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm"
            className="hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)]"
            onClick={() => setDeleteTarget(row)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const DEPT_COLUMNS = [
    {
      key: "code", header: "รหัส", skelWidth: "70px",
      render: (v) => <span className="font-mono text-xs font-bold text-[var(--color-brand)]">{v}</span>,
    },
    {
      key: "name", header: "ชื่อแผนก", skelWidth: "160px",
      render: (v) => <span className="text-sm font-medium text-[var(--color-text-primary)]">{v}</span>,
    },
    {
      key: "description", header: "คำอธิบาย", skelWidth: "200px",
      render: (v) => <span className="text-xs text-[var(--color-text-muted)]">{v || "—"}</span>,
    },
    {
      key: "_count", header: "สมาชิก", align: "center", skelWidth: "70px",
      render: (_, row) => (
        <span className="text-xs font-mono text-[var(--color-text-secondary)]">
          {row._count?.users ?? "—"} คน
        </span>
      ),
    },
    {
      key: "_actions", header: "", skelWidth: "70px",
      render: (_, row) => (
        <div className="flex gap-1 justify-end" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="icon-sm" onClick={() => setEditDept(row)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm"
            className="hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)]"
            onClick={() => setDeleteDept(row)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const TABS = [
    { id: "users",       label: "ผู้ใช้งาน",  icon: Users,     count: usersData?.pagination?.total },
    { id: "departments", label: "แผนก",       icon: Building2, count: depts.length },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="จัดการผู้ใช้งาน"
        subtitle="บัญชีผู้ใช้งานและแผนกในองค์กร — เฉพาะ Admin"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => { refetch(); refetchDepts(); }}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            {tab === "users" && (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="w-3.5 h-3.5" />เพิ่มผู้ใช้
              </Button>
            )}
            {tab === "departments" && (
              <Button size="sm" onClick={() => setCreateDept(true)}>
                <Plus className="w-3.5 h-3.5" />เพิ่มแผนก
              </Button>
            )}
          </>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[var(--color-surface-2)] rounded-lg p-1 w-fit border border-[var(--color-border)]">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              tab === t.id
                ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            )}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.count > 0 && (
              <span className="bg-[var(--color-surface-3)] text-[var(--color-text-muted)] text-[10px] font-mono px-1.5 py-0.5 rounded-full">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {tab === "users" && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] max-w-xs">
              <Input placeholder="ค้นหาชื่อ, อีเมล..."
                prefix={<Search className="w-3.5 h-3.5" />}
                value={userParams.search}
                onChange={e => userParams.handleSearch(e.target.value)} />
            </div>
            <div className="w-44">
              {/* ✅ ใช้ value="ALL" แทน value="" */}
              <Select
                value={userParams.filters.role ?? "ALL"}
                onValueChange={v => userParams.handleFilter("role", v === "ALL" ? null : v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                    <SelectValue placeholder="สิทธิ์" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">ทุกสิทธิ์</SelectItem>
                  {Object.entries(ROLE_CONFIG).map(([v, c]) => (
                    <SelectItem key={v} value={v}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DataTable columns={USER_COLUMNS} data={users}
            pagination={usersData?.pagination} onPageChange={userParams.setPage}
            loading={isLoading} emptyMessage="ไม่พบผู้ใช้งาน" />
        </>
      )}

      {/* Departments Tab */}
      {tab === "departments" && (
        <DataTable columns={DEPT_COLUMNS} data={depts}
          loading={deptLoading} emptyMessage="ยังไม่มีแผนก" />
      )}

      {/* User modals */}
      <FormModal open={createOpen} onOpenChange={setCreateOpen}
        title="สร้างบัญชีผู้ใช้ใหม่" size="lg">
        <UserForm onSuccess={() => setCreateOpen(false)} onCancel={() => setCreateOpen(false)} />
      </FormModal>
      <FormModal open={Boolean(editTarget)} onOpenChange={o => !o && setEditTarget(null)}
        title="แก้ไขข้อมูลผู้ใช้" description={editTarget?.name} size="lg">
        <UserForm defaultValues={editTarget}
          onSuccess={() => setEditTarget(null)} onCancel={() => setEditTarget(null)} />
      </FormModal>
      <ConfirmDialog open={Boolean(deleteTarget)} onOpenChange={o => !o && setDeleteTarget(null)}
        title={`ปิดใช้งาน "${deleteTarget?.name}"?`}
        description="บัญชีจะถูกปิดการใช้งาน ไม่สามารถเข้าสู่ระบบได้"
        confirmLabel="ปิดใช้งาน" loading={deleteUserMutation.isPending}
        onConfirm={async () => { await deleteUserMutation.mutateAsync(deleteTarget.id); setDeleteTarget(null); }} />

      {/* Department modals */}
      <FormModal open={createDept} onOpenChange={setCreateDept}
        title="เพิ่มแผนกใหม่" size="sm">
        <DepartmentForm onSuccess={() => setCreateDept(false)} onCancel={() => setCreateDept(false)} />
      </FormModal>
      <FormModal open={Boolean(editDept)} onOpenChange={o => !o && setEditDept(null)}
        title="แก้ไขแผนก" description={editDept?.name} size="sm">
        <DepartmentForm defaultValues={editDept}
          onSuccess={() => setEditDept(null)} onCancel={() => setEditDept(null)} />
      </FormModal>
      <ConfirmDialog open={Boolean(deleteDept)} onOpenChange={o => !o && setDeleteDept(null)}
        title={`ลบแผนก "${deleteDept?.name}"?`}
        description="สมาชิกในแผนกจะไม่ถูกลบ แต่จะไม่มีแผนก"
        confirmLabel="ลบแผนก" loading={deleteDeptMutation.isPending}
        onConfirm={async () => { await deleteDeptMutation.mutateAsync(deleteDept.id); setDeleteDept(null); }} />
    </div>
  );
}