import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Warehouse, MapPin, Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FormModal } from "@/components/common/FormModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { WarehouseForm } from "./WarehouseForm";
import { LocationForm } from "./LocationForm";
import {
  useWarehouses, useDeleteWarehouse,
  useLocations, useDeleteLocation,
} from "@/services/warehousesService";
import { useTableParams } from "@/hooks/useTableParams";
import { DataTable } from "@/components/common/DataTable";
import { cn } from "@/utils/cn";

export default function WarehousesPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("warehouses");
  const [createWHOpen, setCreateWHOpen] = useState(false);
  const [editWH, setEditWH] = useState(null);
  const [deleteWH, setDeleteWH] = useState(null);
  const [createLocOpen, setCreateLocOpen] = useState(false);
  const [editLoc, setEditLoc] = useState(null);
  const [deleteLoc, setDeleteLoc] = useState(null);

  const { queryParams, handleSearch, search } = useTableParams();
  const { data: whData, isLoading: whLoading } = useWarehouses(queryParams);
  const { data: locData, isLoading: locLoading } = useLocations(queryParams);
  const deleteWHMutation = useDeleteWarehouse();
  const deleteLocMutation = useDeleteLocation();
  console.log(whData)
  const warehouses = whData ?? [];
  const locations  = locData ?? [];

  const LOC_COLUMNS = [
    {
      key: "code", header: "รหัส Location", mono: true, skelWidth: "90px",
      render: (v) => <span className="font-mono text-xs text-[var(--color-brand)]">{v}</span>,
    },
    { key: "name", header: "ชื่อ", skelWidth: "160px" },
    {
      key: "warehouse", header: "คลัง", skelWidth: "110px",
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <Warehouse className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <span className="text-sm">{row.warehouse?.name ?? "—"}</span>
        </div>
      ),
    },
    {
      key: "description", header: "คำอธิบาย", skelWidth: "150px",
      render: (v) => <span className="text-xs text-[var(--color-text-muted)]">{v ?? "—"}</span>,
    },
    {
      key: "isActive", header: "สถานะ", skelWidth: "60px",
      render: (v) => <Badge variant={v ? "success" : "cancelled"}>{v ? "ใช้งาน" : "ปิด"}</Badge>,
    },
    {
      key: "_actions", header: "",
      render: (_, row) => (
        <div className="flex gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon-sm" onClick={() => setEditLoc(row)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm"
            className="hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)]"
            onClick={() => setDeleteLoc(row)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="คลัง & ตำแหน่งจัดเก็บ"
        subtitle="จัดการคลังสินค้าและตำแหน่ง Location ทั้งหมด"
        actions={
          <Button size="sm" onClick={() => tab === "warehouses" ? setCreateWHOpen(true) : setCreateLocOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            {tab === "warehouses" ? "เพิ่มคลัง" : "เพิ่ม Location"}
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[var(--color-surface-2)] rounded-lg p-1 w-fit border border-[var(--color-border)]">
        {[
          { id: "warehouses", label: "คลังสินค้า", icon: Warehouse },
          { id: "locations",  label: "Locations",  icon: MapPin },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              tab === t.id
                ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            )}
          >
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="max-w-xs">
        <Input placeholder="ค้นหา..." prefix={<Search className="w-3.5 h-3.5" />}
          value={search} onChange={(e) => handleSearch(e.target.value)} />
      </div>

      {/* Warehouses Grid */}
      {tab === "warehouses" && (
        whLoading
          ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="skeleton h-40 rounded-lg" />)}
            </div>
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {warehouses.map((wh) => (
                <Card key={wh.id}
                  className="cursor-pointer hover:border-[var(--color-brand)] hover:shadow-[var(--shadow-glow)] transition-all duration-200 group"
                  onClick={() => navigate(`/warehouses/${wh.id}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-[var(--color-brand-subtle)] text-[var(--color-brand)]">
                        <Warehouse className="w-5 h-5" />
                      </div>
                      <Badge variant={wh.isActive ? "success" : "cancelled"}>
                        {wh.isActive ? "ใช้งาน" : "ปิด"}
                      </Badge>
                    </div>
                    <p className="font-mono text-xs text-[var(--color-brand)] mb-0.5">{wh.code}</p>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">{wh.name}</p>
                    {wh.address && (
                      <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">{wh.address}</p>
                    )}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--color-border)]">
                      <span className="text-xs text-[var(--color-text-muted)] font-mono">
                        {wh.locations?.length ?? 0} locations
                      </span>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon-sm" onClick={() => setEditWH(wh)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm"
                          className="hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)]"
                          onClick={() => setDeleteWH(wh)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {warehouses.length === 0 && !whLoading && (
                <div className="col-span-3 py-12 text-center text-[var(--color-text-muted)] text-sm">
                  <Warehouse className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  ยังไม่มีคลังสินค้า
                </div>
              )}
            </div>
      )}

      {/* Locations Table */}
      {tab === "locations" && (
        <DataTable
          columns={LOC_COLUMNS}
          data={locations}
          pagination={locData?.pagination}
          loading={locLoading}
          emptyMessage="ยังไม่มี Location"
        />
      )}

      {/* Modals */}
      <FormModal open={createWHOpen} onOpenChange={setCreateWHOpen} title="เพิ่มคลังสินค้าใหม่" size="md">
        <WarehouseForm onSuccess={() => setCreateWHOpen(false)} onCancel={() => setCreateWHOpen(false)} />
      </FormModal>
      <FormModal open={Boolean(editWH)} onOpenChange={(o) => !o && setEditWH(null)}
        title="แก้ไขคลังสินค้า" description={editWH?.name} size="md">
        <WarehouseForm defaultValues={editWH} onSuccess={() => setEditWH(null)} onCancel={() => setEditWH(null)} />
      </FormModal>
      <FormModal open={createLocOpen} onOpenChange={setCreateLocOpen} title="เพิ่ม Location ใหม่" size="md">
        <LocationForm onSuccess={() => setCreateLocOpen(false)} onCancel={() => setCreateLocOpen(false)} />
      </FormModal>
      <FormModal open={Boolean(editLoc)} onOpenChange={(o) => !o && setEditLoc(null)}
        title="แก้ไข Location" description={editLoc?.name} size="md">
        <LocationForm defaultValues={editLoc} onSuccess={() => setEditLoc(null)} onCancel={() => setEditLoc(null)} />
      </FormModal>

      <ConfirmDialog open={Boolean(deleteWH)} onOpenChange={(o) => !o && setDeleteWH(null)}
        title={`ปิดใช้งานคลัง "${deleteWH?.name}"?`}
        description="ต้องไม่มี Location ที่ยังใช้งานอยู่"
        confirmLabel="ปิดใช้งาน" loading={deleteWHMutation.isPending}
        onConfirm={async () => { await deleteWHMutation.mutateAsync(deleteWH.id); setDeleteWH(null); }}
      />
      <ConfirmDialog open={Boolean(deleteLoc)} onOpenChange={(o) => !o && setDeleteLoc(null)}
        title={`ปิดใช้งาน "${deleteLoc?.code}"?`}
        confirmLabel="ปิดใช้งาน" loading={deleteLocMutation.isPending}
        onConfirm={async () => { await deleteLocMutation.mutateAsync(deleteLoc.id); setDeleteLoc(null); }}
      />
    </div>
  );
}
