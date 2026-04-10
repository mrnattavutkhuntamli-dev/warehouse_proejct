import { useState } from "react";
import {
  Package, AlertTriangle, Wrench, ShoppingCart,
  TrendingUp, TrendingDown, RefreshCw, DollarSign,
  BarChart3, Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartCard, ChartTooltip } from "@/components/charts/ChartCard";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useDashboardOverview,
  useInventoryValue,
  useTopIssuedMaterials,
  useSupplierStats,
  useStockMovement,
  useToolUtilization,
} from "@/services/dashboardService";
import { formatCurrency, formatNumber, formatDate } from "@/utils/formatters";
import { cn } from "@/utils/cn";

// ── chart color palette ── matches Industrial Dark theme ──────────────────────
const COLORS = {
  brand:   "#f59e0b",
  success: "#10b981",
  info:    "#3b82f6",
  danger:  "#ef4444",
  purple:  "#8b5cf6",
  pink:    "#ec4899",
  teal:    "#14b8a6",
  orange:  "#f97316",
};
const PALETTE = Object.values(COLORS);

// ── shared Recharts axis/grid styles ─────────────────────────────────────────
const AXIS_STYLE = { fill: "#64748b", fontSize: 11, fontFamily: "var(--font-mono)" };
const GRID_STYLE = { stroke: "#1e293b", strokeDasharray: "3 3" };

// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [movementDays, setMovementDays] = useState("30");
  const [topN, setTopN]                 = useState("10");

  const { data: overview, isLoading: ovLoading, refetch: refetchAll } = useDashboardOverview();
  const { data: invValue, isLoading: invLoading } = useInventoryValue();
  const { data: topIssued, isLoading: topLoading } = useTopIssuedMaterials({ limit: Number(topN) });
  const { data: supplierStats, isLoading: supLoading } = useSupplierStats();
  const { data: movement, isLoading: movLoading } = useStockMovement({ days: Number(movementDays) });
  const { data: toolUtil, isLoading: toolLoading } = useToolUtilization();

  // ── KPI helpers ──────────────────────────────────────────────────────────
  const tool = overview?.toolAvailability ?? {};
  const toolUtilRate = tool.total > 0
    ? Math.round((tool.borrowed / tool.total) * 100)
    : 0;

  // ── Inventory value → pie data ────────────────────────────────────────────
  const invPieData = (invValue?.categories ?? []).map((c, i) => ({
    name:  c.name,
    value: c.totalValue,
    color: PALETTE[i % PALETTE.length],
  }));
  const totalInvValue = invPieData.reduce((s, d) => s + d.value, 0);

  // ── Stock movement → line/area data ──────────────────────────────────────
  const movData = (movement?.data ?? []).map(d => ({
    date: formatDate(d.date, "dd/MM"),
    เข้า: d.totalIn  ?? 0,
    ออก:  d.totalOut ?? 0,
    net:  (d.totalIn ?? 0) - (d.totalOut ?? 0),
  }));

  // ── Tool utilization → donut data ────────────────────────────────────────
  const toolPieData = toolUtil?.categories?.length > 0
    ? toolUtil.categories.map((c, i) => ({
        name:     c.name,
        borrowed: c.borrowed,
        available: c.available,
        total:    c.total,
        color:    PALETTE[i % PALETTE.length],
      }))
    : null;

  const toolDonutData = tool.total > 0
    ? [
        { name: "ว่าง",       value: tool.available   ?? 0, color: COLORS.success },
        { name: "ถูกยืม",     value: tool.borrowed    ?? 0, color: COLORS.brand },
        { name: "ซ่อมบำรุง",  value: tool.maintenance ?? 0, color: COLORS.info },
        { name: "ชำรุด",      value: tool.broken      ?? 0, color: COLORS.danger },
      ].filter(d => d.value > 0)
    : [];

  // ── Supplier stats → bar data ─────────────────────────────────────────────
  const supData = (supplierStats?.suppliers ?? [])
    .slice(0, 8)
    .map(s => ({
      name:   s.name?.length > 14 ? s.name.slice(0, 14) + "…" : s.name,
      PO:     s.poCount,
      มูลค่า: s.totalAmount,
    }));

  // ── Top issued → bar data ─────────────────────────────────────────────────
  const topData = (topIssued?.data ?? []).map(m => ({
    name:   m.name?.length > 16 ? m.name.slice(0, 16) + "…" : m.name,
    เบิก:   m.totalIssued,
    code:   m.code,
    unit:   m.unit,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="ภาพรวมและสถิติระบบจัดการคลังสินค้า"
        actions={
          <Button variant="ghost" size="sm" onClick={() => refetchAll()}>
            <RefreshCw className="w-3.5 h-3.5" />รีเฟรช
          </Button>
        }
      />

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="วัสดุทั้งหมด"
          value={overview?.totalMaterials}
          icon={<Package />}
          description="รายการที่ active"
          color="amber"
          loading={ovLoading}
        />
        <StatCard
          title="สต็อกต่ำ"
          value={overview?.lowStockCount}
          icon={<AlertTriangle />}
          description="ต้องสั่งซื้อเพิ่ม"
          color="red"
          loading={ovLoading}
        />
        <StatCard
          title="PO รอดำเนินการ"
          value={overview?.pendingPOs}
          icon={<ShoppingCart />}
          description="DRAFT + APPROVED"
          color="blue"
          loading={ovLoading}
        />
        <StatCard
          title="เครื่องมือว่าง"
          value={tool?.available}
          icon={<Wrench />}
          description={`ถูกยืม ${tool?.borrowed ?? 0} · ทั้งหมด ${tool?.total ?? 0}`}
          color="green"
          loading={ovLoading}
        />
      </div>

      {/* ── KPI Row 2: Value cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total inventory value */}
        <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-[var(--color-brand-subtle)]">
              <DollarSign className="w-4 h-4 text-[var(--color-brand)]" />
            </div>
            <p className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)]">
              มูลค่าสินค้าคงคลัง
            </p>
          </div>
          {invLoading ? (
            <div className="skeleton h-7 w-40 rounded" />
          ) : (
            <p className="text-2xl font-bold font-mono tabular-nums text-[var(--color-brand)]">
              {formatCurrency(totalInvValue)}
            </p>
          )}
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {invPieData.length} หมวดหมู่
          </p>
        </div>

        {/* Tool utilization rate */}
        <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-[var(--color-info-subtle)]">
              <Activity className="w-4 h-4 text-[var(--color-info)]" />
            </div>
            <p className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)]">
              อัตราการใช้เครื่องมือ
            </p>
          </div>
          {ovLoading ? (
            <div className="skeleton h-7 w-24 rounded" />
          ) : (
            <p className="text-2xl font-bold font-mono tabular-nums text-[var(--color-info)]">
              {toolUtilRate}%
            </p>
          )}
          <div className="mt-2 h-1.5 bg-[var(--color-surface-3)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--color-info)] transition-all duration-700"
              style={{ width: `${toolUtilRate}%` }}
            />
          </div>
        </div>

        {/* Issues this month */}
        <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-[var(--color-success-subtle)]">
              <BarChart3 className="w-4 h-4 text-[var(--color-success)]" />
            </div>
            <p className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)]">
              เบิกวัสดุเดือนนี้
            </p>
          </div>
          {ovLoading ? (
            <div className="skeleton h-7 w-24 rounded" />
          ) : (
            <p className="text-2xl font-bold font-mono tabular-nums text-[var(--color-success)]">
              {overview?.issuesThisMonth ?? "—"}
            </p>
          )}
          <p className="text-xs text-[var(--color-text-muted)] mt-1">ใบเบิก</p>
        </div>
      </div>

      {/* ── Row 1: Stock Movement + Inventory Value Pie ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stock Movement AreaChart — 2/3 width */}
        <ChartCard
          title="การเคลื่อนไหวสต็อก"
          subtitle={`ย้อนหลัง ${movementDays} วัน`}
          loading={movLoading}
          empty={!movLoading && movData.length === 0}
          height={260}
          className="lg:col-span-2"
          actions={
            <Select value={movementDays} onValueChange={setMovementDays}>
              <SelectTrigger className="h-7 text-xs w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 วัน</SelectItem>
                <SelectItem value="14">14 วัน</SelectItem>
                <SelectItem value="30">30 วัน</SelectItem>
                <SelectItem value="90">90 วัน</SelectItem>
              </SelectContent>
            </Select>
          }
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={movData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={COLORS.success} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={COLORS.danger} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="date" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
              <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} width={36} />
              <RechartsTooltip
                content={<ChartTooltip formatter={(v) => formatNumber(v, 0)} />}
                cursor={{ stroke: "var(--color-border-strong)", strokeWidth: 1 }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-mono)", paddingTop: 8 }}
              />
              <Area
                type="monotone" dataKey="เข้า" stroke={COLORS.success}
                fill="url(#gradIn)" strokeWidth={2} dot={false} activeDot={{ r: 4 }}
              />
              <Area
                type="monotone" dataKey="ออก" stroke={COLORS.danger}
                fill="url(#gradOut)" strokeWidth={2} dot={false} activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Inventory Value Pie — 1/3 width */}
        <ChartCard
          title="มูลค่าสินค้า"
          subtitle="แยกตามหมวดหมู่"
          loading={invLoading}
          empty={!invLoading && invPieData.length === 0}
          height={260}
        >
          <div className="flex flex-col h-full">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={invPieData}
                  cx="50%" cy="50%"
                  innerRadius={42} outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {invPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  content={<ChartTooltip formatter={(v) => formatCurrency(v)} />}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex-1 overflow-y-auto space-y-1 px-2 pb-1">
              {invPieData.slice(0, 5).map((d) => (
                <div key={d.name} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-[var(--color-text-muted)] truncate">{d.name}</span>
                  </div>
                  <span className="font-mono tabular-nums text-[var(--color-text-secondary)] shrink-0">
                    {totalInvValue > 0
                      ? `${Math.round((d.value / totalInvValue) * 100)}%`
                      : "—"
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* ── Row 2: Top Issued + Tool Utilization ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Issued Materials — BarChart */}
        <ChartCard
          title="วัสดุที่เบิกมากที่สุด"
          subtitle="เรียงตามจำนวนเบิกสะสม"
          loading={topLoading}
          empty={!topLoading && topData.length === 0}
          height={280}
          className="lg:col-span-2"
          actions={
            <Select value={topN} onValueChange={setTopN}>
              <SelectTrigger className="h-7 text-xs w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Top 5</SelectItem>
                <SelectItem value="10">Top 10</SelectItem>
                <SelectItem value="20">Top 20</SelectItem>
              </SelectContent>
            </Select>
          }
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={topData}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid {...GRID_STYLE} horizontal={false} />
              <XAxis type="number" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
              <YAxis
                type="category" dataKey="name"
                tick={{ ...AXIS_STYLE, fontSize: 10 }}
                tickLine={false} axisLine={false}
                width={110}
              />
              <RechartsTooltip
                content={
                  <ChartTooltip
                    formatter={(v, name, entry) =>
                      `${formatNumber(v, 0)} ${entry?.payload?.unit ?? ""}`
                    }
                  />
                }
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Bar
                dataKey="เบิก"
                fill={COLORS.brand}
                radius={[0, 4, 4, 0]}
                maxBarSize={18}
              >
                {topData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={`hsl(${38 + i * 4}, ${90 - i * 2}%, ${55 - i * 1}%)`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Tool Utilization — Donut */}
        <ChartCard
          title="สถานะเครื่องมือ"
          subtitle="สัดส่วน ว่าง / ยืม / ซ่อม"
          loading={ovLoading || toolLoading}
          empty={!ovLoading && toolDonutData.length === 0}
          height={280}
        >
          <div className="flex flex-col h-full items-center">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={toolDonutData}
                  cx="50%" cy="50%"
                  innerRadius={48} outerRadius={72}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {toolDonutData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  content={<ChartTooltip formatter={(v) => `${v} ชิ้น`} />}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div className="text-center -mt-2 mb-3">
              <p className="text-3xl font-bold tabular-nums text-[var(--color-text-primary)]">
                {tool.total ?? 0}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] font-mono">ชิ้นทั้งหมด</p>
            </div>

            {/* Legend */}
            <div className="w-full space-y-1.5 px-3">
              {toolDonutData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-[var(--color-text-muted)]">{d.name}</span>
                  </div>
                  <span className="font-mono font-bold tabular-nums text-[var(--color-text-primary)]">
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* ── Row 3: Supplier Stats + Tool Category Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Supplier PO stats */}
        <ChartCard
          title="สถิติผู้จำหน่าย"
          subtitle="จำนวน PO ตามซัพพลายเออร์"
          loading={supLoading}
          empty={!supLoading && supData.length === 0}
          height={240}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={supData} margin={{ top: 4, right: 16, left: -12, bottom: 20 }}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis
                dataKey="name"
                tick={{ ...AXIS_STYLE, fontSize: 10 }}
                tickLine={false} axisLine={false}
                angle={-30} textAnchor="end" height={48}
              />
              <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} width={30} />
              <RechartsTooltip
                content={<ChartTooltip formatter={(v, n) => n === "มูลค่า" ? formatCurrency(v) : `${v} PO`} />}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Bar dataKey="PO" fill={COLORS.info} radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Tool utilization by category */}
        <ChartCard
          title="การใช้เครื่องมือแยกหมวดหมู่"
          subtitle="ถูกยืม vs ว่าง"
          loading={toolLoading}
          empty={!toolLoading && (!toolPieData || toolPieData.length === 0)}
          emptyMessage="ยังไม่มีข้อมูลหมวดหมู่"
          height={240}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={toolPieData ?? []}
              margin={{ top: 4, right: 16, left: -12, bottom: 20 }}
            >
              <CartesianGrid {...GRID_STYLE} />
              <XAxis
                dataKey="name"
                tick={{ ...AXIS_STYLE, fontSize: 10 }}
                tickLine={false} axisLine={false}
                angle={-25} textAnchor="end" height={44}
              />
              <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} width={28} />
              <RechartsTooltip
                content={<ChartTooltip formatter={(v) => `${v} ชิ้น`} />}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-mono)" }} />
              <Bar dataKey="available" name="ว่าง"   fill={COLORS.success} radius={[3,3,0,0]} maxBarSize={24} stackId="a" />
              <Bar dataKey="borrowed"  name="ยืม"    fill={COLORS.brand}   radius={[3,3,0,0]} maxBarSize={24} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row 4: Low stock alert table ── */}
      {(overview?.lowStockCount ?? 0) > 0 && (
        <LowStockAlert overview={overview} />
      )}
    </div>
  );
}

// ── Low Stock Alert mini-table ────────────────────────────────────────────────
function LowStockAlert({ overview }) {
  const items = overview?.lowStockItems ?? [];
  if (items.length === 0) return null;
  return (
    <div className="rounded-xl bg-[var(--color-danger-subtle)]/40 border border-[var(--color-danger)]/30 p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-[var(--color-danger)]" />
        <h3 className="text-sm font-semibold text-[var(--color-danger)]">
          วัสดุสต็อกต่ำ — ต้องสั่งซื้อเพิ่ม ({items.length} รายการ)
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {items.slice(0, 6).map((item) => (
          <div key={item.id}
            className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg
              bg-[var(--color-surface)] border border-[var(--color-border)]"
          >
            <div className="min-w-0">
              <p className="text-xs font-mono text-[var(--color-brand)] truncate">{item.code}</p>
              <p className="text-xs text-[var(--color-text-primary)] truncate">{item.name}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold tabular-nums text-[var(--color-danger)]">
                {formatNumber(item.currentStock, 2)}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)]">/ {formatNumber(item.minStock, 0)} {item.unit}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
