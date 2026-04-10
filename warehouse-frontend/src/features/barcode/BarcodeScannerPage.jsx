import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera, CameraOff, ScanLine, X, RefreshCw, ChevronRight,
  Package, MapPin, Wrench, Search, History, Copy, CheckCheck,
  Maximize2, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToolStatusBadge } from "@/components/common/ToolStatusBadge";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { barcodeApi } from "@/services/usersService";
import { formatNumber, formatCurrency, formatDate } from "@/utils/formatters";
import { cn } from "@/utils/cn";

const SCANNER_ID = "wms-qr-reader";

// Result type config
const ENTITY_CONFIG = {
  material: {
    label:  "วัสดุ",
    icon:   Package,
    color:  "text-[var(--color-brand)]",
    bg:     "bg-[var(--color-brand-subtle)]",
    nav:    (d) => `/inventory/${d.id}`,
  },
  location: {
    label:  "Location",
    icon:   MapPin,
    color:  "text-[var(--color-success)]",
    bg:     "bg-[var(--color-success-subtle)]",
    nav:    (d) => `/warehouses/${d.warehouseId}`,
  },
  tool: {
    label:  "เครื่องมือ",
    icon:   Wrench,
    color:  "text-[var(--color-info)]",
    bg:     "bg-[var(--color-info-subtle)]",
    nav:    (d) => `/tools/${d.id}`,
  },
};

export default function BarcodeScannerPage() {
  const navigate  = useNavigate();
  const [manualInput, setManualInput] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError,   setLookupError]   = useState(null);
  const [scanHistory,   setScanHistory]   = useState([]);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState("scan"); // "scan" | "history"
  const [camsLoaded, setCamsLoaded] = useState(false);

  // ─── Barcode scanner hook ──────────────────────────────────────────────────
  const handleScan = useCallback(async (code) => {
    if (!code) return;
    toast.dismiss();
    setLookupError(null);
    setLookupLoading(true);
    setLookupResult(null);

    try {
      const res = await barcodeApi.scan({ code });
      const data = res.data;
      setLookupResult(data);
      setScanHistory(prev => [
        { code, result: data, ts: new Date().toISOString() },
        ...prev.slice(0, 19),
      ]);
      toast.success(`พบ${ENTITY_CONFIG[data.type]?.label ?? "รายการ"}: ${data.data?.name ?? code}`);
    } catch (err) {
      const msg = err.response?.status === 404
        ? `ไม่พบรายการสำหรับ "${code}"`
        : "เกิดข้อผิดพลาดในการค้นหา";
      setLookupError(msg);
      toast.error(msg);
    } finally {
      setLookupLoading(false);
    }
  }, []);

  const {
    containerId, isScanning, isLoading: camLoading, error: camError,
    cameras, activeCam, loadCameras, startScan, stopScan, switchCamera,
    lastResult,
  } = useBarcodeScanner({ onScan: handleScan, containerId: SCANNER_ID });

  // Load cameras on mount
  useEffect(() => {
    loadCameras().then(cams => {
      setCamsLoaded(true);
    });
  }, []);

  // ── Manual lookup ──────────────────────────────────────────────────────────
  const handleManualLookup = async () => {
    const code = manualInput.trim();
    if (!code) return;
    await handleScan(code);
    setManualInput("");
  };

  // ── Copy to clipboard ──────────────────────────────────────────────────────
  const copyCode = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const cfg = lookupResult ? ENTITY_CONFIG[lookupResult.type] : null;
  const Icon = cfg?.icon ?? Package;

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <PageHeader
        title="Barcode Scanner"
        subtitle="สแกน QR Code หรือ Barcode เพื่อค้นหาวัสดุ, Location หรือเครื่องมือ"
      />

      {/* Mode tabs */}
      <div className="flex items-center gap-1 bg-[var(--color-surface-2)] rounded-lg p-1 w-fit border border-[var(--color-border)]">
        {[
          { id: "scan",    label: "สแกน",        icon: ScanLine },
          { id: "history", label: `ประวัติ (${scanHistory.length})`, icon: History },
        ].map(t => (
          <button key={t.id} onClick={() => setMode(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              mode === t.id
                ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            )}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {/* ── Scan Mode ── */}
      {mode === "scan" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Camera panel */}
          <div className="space-y-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[var(--color-brand)]" />
                  กล้องสแกน
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Camera viewport */}
                <div className="relative rounded-lg overflow-hidden bg-[var(--color-surface-3)] border border-[var(--color-border)]"
                  style={{ minHeight: 240 }}>

                  {/* html5-qrcode mounts here */}
                  <div id={SCANNER_ID} className="w-full" />

                  {/* Overlay when not scanning */}
                  {!isScanning && !camLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--color-surface-3)]">
                      <Camera className="w-12 h-12 text-[var(--color-text-muted)] opacity-30" />
                      <p className="text-sm text-[var(--color-text-muted)] font-mono text-center px-4">
                        กดปุ่ม "เริ่มกล้อง" เพื่อสแกน
                      </p>
                    </div>
                  )}

                  {/* Loading overlay */}
                  {camLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface-3)]">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-6 h-6 text-[var(--color-brand)] animate-spin" />
                        <p className="text-xs text-[var(--color-text-muted)]">กำลังเปิดกล้อง...</p>
                      </div>
                    </div>
                  )}

                  {/* Scanning frame overlay */}
                  {isScanning && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-48 h-48 relative">
                        {/* Corner brackets */}
                        {["top-0 left-0", "top-0 right-0 rotate-90", "bottom-0 right-0 rotate-180", "bottom-0 left-0 -rotate-90"].map((pos, i) => (
                          <div key={i} className={cn("absolute w-8 h-8", pos)}>
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-[var(--color-brand)]" />
                            <div className="absolute top-0 left-0 w-0.5 h-full bg-[var(--color-brand)]" />
                          </div>
                        ))}
                        {/* Scan line animation */}
                        <div className="absolute inset-x-0 top-1/2 h-0.5 bg-[var(--color-brand)] opacity-70 animate-[scan-line_2s_ease-in-out_infinite]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Camera error */}
                {camError && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--color-danger-subtle)] border border-[var(--color-danger)]/30">
                    <AlertCircle className="w-4 h-4 text-[var(--color-danger)] shrink-0 mt-0.5" />
                    <p className="text-xs text-[var(--color-danger)]">{camError}</p>
                  </div>
                )}

                {/* Camera selector */}
                {cameras.length > 1 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {cameras.map(cam => (
                      <button key={cam.id}
                        onClick={() => switchCamera(cam.id)}
                        className={cn(
                          "px-2 py-1 rounded text-xs font-mono transition-all border",
                          activeCam === cam.id
                            ? "bg-[var(--color-brand)] text-white border-[var(--color-brand)]"
                            : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-brand)]"
                        )}>
                        {cam.label.length > 20 ? cam.label.slice(0, 20) + "…" : cam.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Start/Stop button */}
                <Button
                  className="w-full"
                  variant={isScanning ? "ghost-destructive" : "default"}
                  loading={camLoading}
                  onClick={isScanning ? stopScan : () => startScan()}
                >
                  {isScanning ? (
                    <><CameraOff className="w-4 h-4" />หยุดกล้อง</>
                  ) : (
                    <><Camera className="w-4 h-4" />เริ่มกล้อง</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Manual input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[var(--color-brand)]" />
                  ป้อนรหัสด้วยตนเอง
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="MAT-001, LOC-A01, TOOL-003..."
                    value={manualInput}
                    onChange={e => setManualInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleManualLookup()}
                    className="font-mono text-sm"
                  />
                  <Button onClick={handleManualLookup} loading={lookupLoading} disabled={!manualInput.trim()}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Result panel */}
          <div className="space-y-3">
            {/* Last scan code */}
            {lastResult && (
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                <div className="flex items-center gap-2 min-w-0">
                  <ScanLine className="w-3.5 h-3.5 text-[var(--color-brand)] shrink-0" />
                  <span className="text-xs font-mono text-[var(--color-text-secondary)] truncate">{lastResult}</span>
                </div>
                <button onClick={() => copyCode(lastResult)}
                  className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors">
                  {copied ? <CheckCheck className="w-3.5 h-3.5 text-[var(--color-success)]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {/* Loading */}
            {lookupLoading && (
              <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8 flex flex-col items-center gap-3">
                <RefreshCw className="w-6 h-6 text-[var(--color-brand)] animate-spin" />
                <p className="text-sm text-[var(--color-text-muted)]">กำลังค้นหา...</p>
              </div>
            )}

            {/* Error */}
            {lookupError && !lookupLoading && (
              <div className="rounded-xl bg-[var(--color-danger-subtle)] border border-[var(--color-danger)]/30 p-5 flex items-center gap-3">
                <X className="w-5 h-5 text-[var(--color-danger)] shrink-0" />
                <p className="text-sm text-[var(--color-danger)]">{lookupError}</p>
              </div>
            )}

            {/* Result card */}
            {lookupResult && !lookupLoading && cfg && (
              <ScanResultCard
                result={lookupResult}
                cfg={cfg}
                onNavigate={() => navigate(cfg.nav(lookupResult.data))}
                onClear={() => setLookupResult(null)}
              />
            )}

            {/* Empty state */}
            {!lookupResult && !lookupLoading && !lookupError && (
              <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] border-dashed p-10 flex flex-col items-center gap-3">
                <Maximize2 className="w-10 h-10 text-[var(--color-text-muted)] opacity-20" />
                <p className="text-sm text-[var(--color-text-muted)] text-center">
                  สแกน QR / Barcode หรือป้อนรหัสเพื่อดูข้อมูล
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── History Mode ── */}
      {mode === "history" && (
        <div className="space-y-2">
          {scanHistory.length === 0 ? (
            <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] border-dashed p-12 flex flex-col items-center gap-3">
              <History className="w-10 h-10 text-[var(--color-text-muted)] opacity-20" />
              <p className="text-sm text-[var(--color-text-muted)]">ยังไม่มีประวัติการสแกน</p>
            </div>
          ) : (
            scanHistory.map((entry, idx) => {
              const ec = entry.result ? ENTITY_CONFIG[entry.result.type] : null;
              const EIcon = ec?.icon ?? Package;
              return (
                <div key={idx}
                  className="flex items-center gap-3 p-3.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-colors group cursor-pointer"
                  onClick={() => entry.result && navigate(ec?.nav(entry.result.data) ?? "#")}
                >
                  <div className={cn("p-2 rounded-lg shrink-0", ec?.bg ?? "bg-[var(--color-surface-2)]")}>
                    <EIcon className={cn("w-4 h-4", ec?.color ?? "text-[var(--color-text-muted)]")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {entry.result?.data?.name ?? entry.code}
                    </p>
                    <p className="text-xs font-mono text-[var(--color-text-muted)] truncate">
                      {entry.code} · {ec?.label ?? "ไม่พบ"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-mono text-[var(--color-text-muted)]">
                      {formatDate(entry.ts)}
                    </p>
                    <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity ml-auto mt-0.5" />
                  </div>
                </div>
              );
            })
          )}

          {scanHistory.length > 0 && (
            <Button variant="ghost" size="sm" className="w-full text-[var(--color-danger)]"
              onClick={() => setScanHistory([])}>
              <X className="w-3.5 h-3.5" />ล้างประวัติ
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Result Card ────────────────────────────────────────────────────────────────
function ScanResultCard({ result, cfg, onNavigate, onClear }) {
  const { type, data } = result;
  const Icon = cfg.icon;

  return (
    <div className="rounded-xl bg-[var(--color-surface)] border-2 border-[var(--color-brand)]/30 overflow-hidden animate-fade-in">
      {/* Type banner */}
      <div className={cn("flex items-center gap-2 px-4 py-2.5", cfg.bg)}>
        <Icon className={cn("w-4 h-4", cfg.color)} />
        <span className={cn("text-xs font-bold font-mono uppercase tracking-widest", cfg.color)}>
          {cfg.label}
        </span>
        <button onClick={onClear} className="ml-auto text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {type === "material" && <MaterialResult data={data} />}
        {type === "location" && <LocationResult data={data} />}
        {type === "tool" && <ToolResult data={data} />}
      </div>

      {/* Navigate button */}
      <div className="px-4 pb-4">
        <Button className="w-full" variant="secondary" size="sm" onClick={onNavigate}>
          ดูรายละเอียด <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function MaterialResult({ data }) {
  return (
    <>
      <div>
        <p className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase mb-0.5">ชื่อวัสดุ</p>
        <p className="text-base font-bold text-[var(--color-text-primary)]">{data.name}</p>
        <p className="text-xs font-mono text-[var(--color-brand)]">{data.code}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase mb-0.5">สต็อกรวม</p>
          <p className="text-lg font-bold tabular-nums text-[var(--color-success)]">
            {formatNumber(data.currentStock ?? 0, 2)}
            <span className="text-xs text-[var(--color-text-muted)] ml-1">{data.unit}</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase mb-0.5">ราคา/หน่วย</p>
          <p className="text-sm font-bold tabular-nums text-[var(--color-text-primary)]">
            {formatCurrency(data.unitPrice ?? 0)}
          </p>
        </div>
      </div>
      {data.category && (
        <Badge variant="default">{data.category.name}</Badge>
      )}
    </>
  );
}

function LocationResult({ data }) {
  return (
    <>
      <div>
        <p className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase mb-0.5">Location</p>
        <p className="text-base font-bold text-[var(--color-text-primary)]">{data.name}</p>
        <p className="text-xs font-mono text-[var(--color-success)]">{data.code}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase mb-0.5">คลังสินค้า</p>
          <p className="text-sm text-[var(--color-text-primary)]">{data.warehouse?.name ?? "—"}</p>
        </div>
        <div>
          <p className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase mb-0.5">ประเภท</p>
          <p className="text-sm text-[var(--color-text-secondary)]">{data.locationType ?? "—"}</p>
        </div>
      </div>
      {data.description && (
        <p className="text-xs text-[var(--color-text-muted)]">{data.description}</p>
      )}
    </>
  );
}

function ToolResult({ data }) {
  return (
    <>
      <div>
        <p className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase mb-0.5">เครื่องมือ</p>
        <p className="text-base font-bold text-[var(--color-text-primary)]">{data.name}</p>
        <p className="text-xs font-mono text-[var(--color-info)]">{data.code}</p>
      </div>
      <div className="flex items-center gap-3">
        <ToolStatusBadge status={data.status} />
        {data.condition && (
          <span className="text-xs text-[var(--color-text-muted)]">
            สภาพ: {data.condition === "GOOD" ? "ดี" : data.condition === "FAIR" ? "พอใช้" : "แย่"}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {data.brand && (
          <div>
            <p className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase mb-0.5">ยี่ห้อ</p>
            <p className="text-sm text-[var(--color-text-primary)]">{data.brand}</p>
          </div>
        )}
        {data.location && (
          <div>
            <p className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase mb-0.5">ตำแหน่ง</p>
            <p className="text-sm text-[var(--color-text-primary)]">{data.location}</p>
          </div>
        )}
      </div>
      {data.category && (
        <Badge variant="default">{data.category.name}</Badge>
      )}
    </>
  );
}
