import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Warehouse, MapPin, Plus, ChevronRight, Pencil, Package } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormModal } from "@/components/common/FormModal";
import { WarehouseForm } from "./WarehouseForm";
import { LocationForm } from "./LocationForm";
import { useWarehouse } from "@/services/warehousesService";
import { formatNumber } from "@/utils/formatters";
import { cn } from "@/utils/cn";

export default function WarehouseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [addLocOpen, setAddLocOpen] = useState(false);

  const { data: warehouse, isLoading, refetch } = useWarehouse(id);

  if (isLoading) return (
    <div className="space-y-4">
      <div className="skeleton h-8 w-48 rounded" />
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="skeleton h-28 rounded-lg" />)}
      </div>
    </div>
  );

  if (!warehouse) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
      <p className="text-[var(--color-text-muted)]">ไม่พบคลังสินค้า</p>
      <Button variant="outline" size="sm" onClick={() => navigate("/warehouses")}>
        <ArrowLeft className="w-4 h-4" /> กลับ
      </Button>
    </div>
  );

  const locations = warehouse.locations ?? [];
  const totalStock = locations.reduce((sum, loc) =>
    sum + (loc.stocks?.reduce((s, st) => s + st.quantity, 0) ?? 0), 0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={
          <span className="flex items-center gap-1">
            <Link to="/warehouses" className="hover:text-[var(--color-text-primary)] transition-colors">คลัง & ตำแหน่ง</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="font-mono text-[var(--color-brand)]">{warehouse.code}</span>
          </span>
        }
        title={warehouse.name}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate("/warehouses")}>
              <ArrowLeft className="w-3.5 h-3.5" />กลับ
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="w-3.5 h-3.5" />แก้ไข
            </Button>
            <Button size="sm" onClick={() => setAddLocOpen(true)}>
              <Plus className="w-3.5 h-3.5" />เพิ่ม Location
            </Button>
          </>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Locations</p>
            <p className="text-2xl font-bold tabular-nums text-[var(--color-text-primary)]">{locations.length}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">ตำแหน่งทั้งหมด</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)] mb-1">สต็อกรวม</p>
            <p className="text-2xl font-bold tabular-nums text-[var(--color-text-primary)]">
              {formatNumber(totalStock, 0)}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">รายการสินค้า</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)] mb-2">สถานะ</p>
            <Badge variant={warehouse.isActive ? "success" : "cancelled"}>
              {warehouse.isActive ? "ใช้งาน" : "ปิดใช้งาน"}
            </Badge>
            {warehouse.address && (
              <p className="text-xs text-[var(--color-text-muted)] mt-2 line-clamp-2">{warehouse.address}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Locations grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[var(--color-brand)]" />
            <CardTitle>Locations ทั้งหมด</CardTitle>
            <span className="text-xs text-[var(--color-text-muted)] font-mono ml-auto">
              {locations.length} ตำแหน่ง
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <div className="py-8 text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-muted)] opacity-30" />
              <p className="text-sm text-[var(--color-text-muted)]">ยังไม่มี Location</p>
              <Button size="sm" className="mt-3" onClick={() => setAddLocOpen(true)}>
                <Plus className="w-3.5 h-3.5" />เพิ่ม Location แรก
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {locations.map((loc) => {
                const locTotal = loc.stocks?.reduce((s, st) => s + st.quantity, 0) ?? 0;
                const matCount = loc.stocks?.length ?? 0;
                return (
                  <div key={loc.id}
                    className={cn(
                      "p-3.5 rounded-lg border transition-all duration-150",
                      "bg-[var(--color-surface-2)] border-[var(--color-border)]",
                      "hover:border-[var(--color-brand-muted)] hover:bg-[var(--color-surface-3)]",
                      !loc.isActive && "opacity-50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-[var(--color-brand)]">{loc.code}</span>
                      <Badge variant={loc.isActive ? "success" : "cancelled"} className="text-[10px]">
                        {loc.isActive ? "ใช้งาน" : "ปิด"}
                      </Badge>
                    </div>
                    <p className="text-sm text-[var(--color-text-primary)] mb-2">{loc.name}</p>
                    <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)] font-mono border-t border-[var(--color-border)] pt-2">
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" />{matCount} รายการ
                      </span>
                      <span>{formatNumber(locTotal, 0)} ชิ้น</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <FormModal open={editOpen} onOpenChange={setEditOpen} title="แก้ไขคลังสินค้า" size="md">
        <WarehouseForm defaultValues={warehouse} onSuccess={() => { setEditOpen(false); refetch(); }}
          onCancel={() => setEditOpen(false)} />
      </FormModal>
      <FormModal open={addLocOpen} onOpenChange={setAddLocOpen} title="เพิ่ม Location" size="md">
        <LocationForm
          defaultValues={{ warehouseId: id }}
          onSuccess={() => { setAddLocOpen(false); refetch(); }}
          onCancel={() => setAddLocOpen(false)} />
      </FormModal>
    </div>
  );
}
