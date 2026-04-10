import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";
import { th } from "date-fns/locale";

// ─── Date Formatters ──────────────────────────────────────────────────────────

/**
 * Format ISO string → "01 มิ.ย. 2567"
 */
export function formatDate(dateStr, pattern = "dd MMM yyyy") {
  if (!dateStr) return "—";
  const d = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
  if (!isValid(d)) return "—";
  return format(d, pattern, { locale: th });
}

/**
 * Format ISO string → "01 มิ.ย. 2567 10:30"
 */
export function formatDateTime(dateStr) {
  return formatDate(dateStr, "dd MMM yyyy HH:mm");
}

/**
 * "2 ชั่วโมงที่ผ่านมา"
 */
export function formatRelative(dateStr) {
  if (!dateStr) return "—";
  const d = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
  if (!isValid(d)) return "—";
  return formatDistanceToNow(d, { addSuffix: true, locale: th });
}

/**
 * ISO string → "YYYY-MM-DD" for input[type=date]
 */
export function toInputDate(dateStr) {
  if (!dateStr) return "";
  const d = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
  if (!isValid(d)) return "";
  return format(d, "yyyy-MM-dd");
}

// ─── Number / Currency ────────────────────────────────────────────────────────

/**
 * Format number with Thai locale: 1234567.89 → "1,234,567.89"
 */
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(value));
}

/**
 * Format as Thai Baht: 1234 → "฿1,234.00"
 */
export function formatCurrency(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(value));
}

/**
 * Compact: 1234567 → "1.2M"
 */
export function formatCompact(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value));
}

/**
 * Quantity + unit: formatQty(150.5, "ลิตร") → "150.50 ลิตร"
 */
export function formatQty(value, unit = "") {
  const num = formatNumber(value, 2);
  return unit ? `${num} ${unit}` : num;
}

// ─── Status Labels (Thai) ─────────────────────────────────────────────────────

export const STATUS_LABELS = {
  // PO / GR / Issue
  DRAFT:             "ร่าง",
  APPROVED:          "อนุมัติแล้ว",
  CANCELLED:         "ยกเลิก",
  ISSUED:            "จ่ายแล้ว",
  RECEIVED:          "รับครบ",
  PARTIAL_RECEIVED:  "รับบางส่วน",
  // Tools
  AVAILABLE:         "ว่าง",
  BORROWED:          "ถูกยืม",
  MAINTENANCE:       "ซ่อมบำรุง",
  BROKEN:            "ชำรุด",
  RETIRED:           "เลิกใช้",
  // Stock Transaction
  IN:                "รับเข้า",
  OUT:               "เบิกออก",
  TRANSFER:          "โอนย้าย",
  ADJUST:            "ปรับยอด",
  RETURN:            "คืนสินค้า",
  // Condition
  GOOD:              "สภาพดี",
  FAIR:              "พอใช้",
  POOR:              "สภาพแย่",
};

export function getStatusLabel(status) {
  return STATUS_LABELS[status] ?? status;
}

// ─── Status Colors ────────────────────────────────────────────────────────────

export const STATUS_COLORS = {
  DRAFT:            "status-draft",
  APPROVED:         "status-approved",
  ISSUED:           "status-issued",
  CANCELLED:        "status-cancelled",
  RECEIVED:         "status-received",
  PARTIAL_RECEIVED: "status-pending",
  AVAILABLE:        "status-issued",
  BORROWED:         "status-pending",
  MAINTENANCE:      "status-approved",
  BROKEN:           "status-cancelled",
};

export function getStatusColor(status) {
  return STATUS_COLORS[status] ?? "status-draft";
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

/**
 * Truncate long string: "นี่คือข้อความยาวมาก" → "นี่คือข้อ…"
 */
export function truncate(str, maxLen = 40) {
  if (!str) return "";
  return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
}

/**
 * Initials from name: "สมชาย ดีงาม" → "สด"
 */
export function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
