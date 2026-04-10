import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

/**
 * DataTable — Generic paginated table
 *
 * @param {object[]}  columns  — [{ key, header, render?, width?, align?, mono? }]
 * @param {object[]}  data
 * @param {object}    pagination — { total, page, limit, totalPages, hasNext, hasPrev }
 * @param {function}  onPageChange
 * @param {boolean}   loading
 * @param {string}    emptyMessage
 * @param {function}  onRowClick
 */
export function DataTable({
  columns = [],
  data = [],
  pagination,
  onPageChange,
  loading = false,
  emptyMessage = "ไม่มีข้อมูล",
  onRowClick,
  className,
  stickyHeader = false,
}) {
  const skelRows = Array.from({ length: pagination?.limit ?? 10 });

  return (
    <div className={cn("flex flex-col gap-0", className)}>
      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className={cn(
            "bg-[var(--color-surface-2)] border-b border-[var(--color-border)]",
            stickyHeader && "sticky top-0 z-10"
          )}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold tracking-widest uppercase",
                    "text-[var(--color-text-muted)] font-mono",
                    "whitespace-nowrap",
                    col.align === "right"  && "text-right",
                    col.align === "center" && "text-center",
                    col.width && `w-[${col.width}]`
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {/* Loading skeleton */}
            {loading && skelRows.map((_, i) => (
              <tr key={i} className="bg-[var(--color-surface)]">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="skeleton h-4 rounded" style={{ width: col.skelWidth ?? "80%" }} />
                  </td>
                ))}
              </tr>
            ))}

            {/* Empty state */}
            {!loading && data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-[var(--color-text-muted)] text-sm"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl opacity-30">📦</span>
                    <span>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!loading && data.map((row, rowIdx) => (
              <tr
                key={row.id ?? rowIdx}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "bg-[var(--color-surface)] transition-colors duration-100",
                  "hover:bg-[var(--color-surface-2)]",
                  onRowClick && "cursor-pointer",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-[var(--color-text-primary)]",
                      "align-middle",
                      col.align === "right"  && "text-right",
                      col.align === "center" && "text-center",
                      col.mono && "font-mono text-xs tabular-nums",
                    )}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : (row[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-1 pt-3">
          <p className="text-xs text-[var(--color-text-muted)] font-mono">
            แสดง {((pagination.page - 1) * pagination.limit) + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} 
            {" "}จาก {pagination.total.toLocaleString()} รายการ
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost" size="icon-sm"
              disabled={!pagination.hasPrev}
              onClick={() => onPageChange?.(1)}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost" size="icon-sm"
              disabled={!pagination.hasPrev}
              onClick={() => onPageChange?.(pagination.page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-3 text-xs text-[var(--color-text-secondary)] font-mono tabular-nums">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="ghost" size="icon-sm"
              disabled={!pagination.hasNext}
              onClick={() => onPageChange?.(pagination.page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost" size="icon-sm"
              disabled={!pagination.hasNext}
              onClick={() => onPageChange?.(pagination.totalPages)}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
