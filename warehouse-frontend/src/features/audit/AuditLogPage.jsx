import { useState } from "react";
import { Search, RefreshCw, Shield, Filter, Clock } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/common/DataTable";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { ChartCard, ChartTooltip } from "@/components/charts/ChartCard";
import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
} from "recharts";
import { useAuditLogs, useAuditStats } from "@/services/auditService";
import { useTableParams } from "@/hooks/useTableParams";
import { formatDateTime, formatDate } from "@/utils/formatters";
import { cn } from "@/utils/cn";

const ACTION_COLORS = {
  CREATE: { cls: "bg-[var(--color-success-subtle)] text-[var(--color-success)]", label: "CREATE" },
  UPDATE: { cls: "bg-[var(--color-info-subtle)] text-[var(--color-info)]",       label: "UPDATE" },
  DELETE: { cls: "bg-[var(--color-danger-subtle)] text-[var(--color-danger)]",   label: "DELETE" },
  STATUS: { cls: "bg-[var(--color-brand-subtle)] text-[var(--color-brand)]",     label: "STATUS" },
  LOGIN:  { cls: "bg-[var(--color-success-subtle)] text-[var(--color-success)]", label: "LOGIN"  },
};

const ENTITY_OPTS = [
  "Material", "Warehouse", "WarehouseLocation", "Stock",
  "PurchaseOrder", "GoodsReceipt", "MaterialIssue",
  "Tool", "ToolBorrowRecord", "User", "Supplier",
];

const AXIS_STYLE = { fill: "#64748b", fontSize: 11, fontFamily: "var(--font-mono)" };
const GRID_STYLE = { stroke: "#1e293b", strokeDasharray: "3 3" };

export default function AuditLogPage() {
  const [activeTab, setActiveTab] = useState("logs"); // "logs" | "stats"

  const { queryParams, setPage, handleSearch, handleFilter, search, filters } = useTableParams({
    defaultLimit: 25,
  });

  const { data: logsData, isLoading, refetch } = useAuditLogs(queryParams);
  const { data: stats, isLoading: statsLoading } = useAuditStats({ days: 30 });

  const logs = logsData?.data ?? [];

  // Stats chart data
  const activityData = (stats?.daily ?? []).map(d => ({
    date:   formatDate(d.date, "dd/MM"),
    CREATE: d.CREATE ?? 0,
    UPDATE: d.UPDATE ?? 0,
    DELETE: d.DELETE ?? 0,
    STATUS: d.STATUS ?? 0,
  }));

  const entityBreakdown = (stats?.byEntity ?? []).slice(0, 8);

  const COLUMNS = [
    {
      key: "createdAt", header: "วันที่เวลา", skelWidth: "130px",
      render: (v) => (
        <span className="text-xs font-mono text-[var(--color-text-muted)] whitespace-nowrap">
          {formatDateTime(v)}
        </span>
      ),
    },
    {
      key: "action", header: "Action", skelWidth: "70px",
      render: (v) => {
        const cfg = ACTION_COLORS[v] ?? ACTION_COLORS.UPDATE;
        return (
          <span className={cn(
            "inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
            cfg.cls
          )}>
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: "entity", header: "Entity", skelWidth: "120px",
      render: (v) => (
        <span className="text-xs font-mono text-[var(--color-text-secondary)]">{v}</span>
      ),
    },
    {
      key: "entityId", header: "ID", skelWidth: "80px",
      render: (v) => (
        <span className="text-[10px] font-mono text-[var(--color-text-muted)] truncate max-w-[80px] block">
          {v?.slice(0, 8)}…
        </span>
      ),
    },
    {
      key: "user", header: "ผู้ดำเนินการ", skelWidth: "120px",
      render: (_, row) => (
        <div>
          <p className="text-xs text-[var(--color-text-primary)]">{row.user?.name ?? "ระบบ"}</p>
          <p className="text-[10px] font-mono text-[var(--color-text-muted)]">{row.user?.role ?? ""}</p>
        </div>
      ),
    },
    {
      key: "description", header: "รายละเอียด", skelWidth: "200px",
      render: (v) => (
        <span className="text-xs text-[var(--color-text-secondary)] line-clamp-2 max-w-xs">{v ?? "—"}</span>
      ),
    },
    {
      key: "ipAddress", header: "IP", skelWidth: "100px",
      render: (v) => (
        <span className="text-[10px] font-mono text-[var(--color-text-muted)]">{v ?? "—"}</span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit Logs"
        subtitle="บันทึกการดำเนินการทั้งหมดในระบบ — เฉพาะ Admin / Manager"
        actions={
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-3.5 h-3.5" />รีเฟรช
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[var(--color-surface-2)] rounded-lg p-1 w-fit border border-[var(--color-border)]">
        {[
          { id: "logs",  label: "รายการ Logs", icon: Shield },
          { id: "stats", label: "สถิติ",        icon: Clock },
        ].map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              activeTab === t.id
                ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            )}
          >
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {/* ── Logs Tab ── */}
      {activeTab === "logs" && (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] max-w-xs">
              <Input
                placeholder="ค้นหา..."
                prefix={<Search className="w-3.5 h-3.5" />}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="w-36">
              {/* ✅ ใช้ value="ALL" แทน value="" */}
              <Select
                value={filters.action ?? "ALL"}
                onValueChange={(v) => handleFilter("action", v === "ALL" ? null : v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                    <SelectValue placeholder="Action" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">ทุก Action</SelectItem>
                  {Object.keys(ACTION_COLORS).map(a => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-44">
              {/* ✅ ใช้ value="ALL" แทน value="" */}
              <Select
                value={filters.entity ?? "ALL"}
                onValueChange={(v) => handleFilter("entity", v === "ALL" ? null : v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">ทุก Entity</SelectItem>
                  {ENTITY_OPTS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DataTable
            columns={COLUMNS}
            data={logs}
            pagination={logsData?.pagination}
            onPageChange={setPage}
            loading={isLoading}
            emptyMessage="ไม่พบรายการ Audit Log"
          />
        </>
      )}

      {/* ── Stats Tab ── */}
      {activeTab === "stats" && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "ทั้งหมด 30 วัน", value: stats?.total,    color: "text-[var(--color-text-primary)]" },
              { label: "CREATE",         value: stats?.byAction?.CREATE, color: "text-[var(--color-success)]" },
              { label: "UPDATE",         value: stats?.byAction?.UPDATE, color: "text-[var(--color-info)]" },
              { label: "DELETE",         value: stats?.byAction?.DELETE, color: "text-[var(--color-danger)]" },
            ].map((item) => (
              <Card key={item.label}>
                <CardContent className="pt-4 pb-4">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-muted)] mb-1">
                    {item.label}
                  </p>
                  {statsLoading ? (
                    <div className="skeleton h-6 w-20 rounded" />
                  ) : (
                    <p className={cn("text-2xl font-bold font-mono tabular-nums", item.color)}>
                      {item.value?.toLocaleString() ?? "—"}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Activity chart */}
          <ChartCard
            title="กิจกรรมรายวัน"
            subtitle="ย้อนหลัง 30 วัน"
            loading={statsLoading}
            empty={!statsLoading && activityData.length === 0}
            height={240}
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={activityData} margin={{ top: 4, right: 16, left: -12, bottom: 0 }}>
                <CartesianGrid {...GRID_STYLE} />
                <XAxis dataKey="date" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} width={32} />
                <RechartsTooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar dataKey="CREATE" fill="#10b981" stackId="a" maxBarSize={24} />
                <Bar dataKey="UPDATE" fill="#3b82f6" stackId="a" maxBarSize={24} />
                <Bar dataKey="STATUS" fill="#f59e0b" stackId="a" maxBarSize={24} />
                <Bar dataKey="DELETE" fill="#ef4444" stackId="a" radius={[3,3,0,0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Entity breakdown */}
          <ChartCard
            title="กิจกรรมแยกตาม Entity"
            loading={statsLoading}
            empty={!statsLoading && entityBreakdown.length === 0}
            height={220}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={entityBreakdown}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
              >
                <CartesianGrid {...GRID_STYLE} horizontal={false} />
                <XAxis type="number" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                <YAxis
                  type="category" dataKey="entity"
                  tick={{ ...AXIS_STYLE, fontSize: 10 }}
                  tickLine={false} axisLine={false}
                  width={130}
                />
                <RechartsTooltip
                  content={<ChartTooltip formatter={(v) => `${v} ครั้ง`} />}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[0,4,4,0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}