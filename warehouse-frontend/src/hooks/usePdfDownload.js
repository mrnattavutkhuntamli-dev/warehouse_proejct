import { useState } from "react";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance";
import { endpoints } from "@/api/endpoints";

/**
 * usePdfDownload — trigger PDF download from backend
 *
 * Usage:
 *   const { downloadPO, isDownloading } = usePdfDownload();
 *   <Button onClick={() => downloadPO(id)}>Download</Button>
 */
export function usePdfDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const download = async (url, filename) => {
    setIsDownloading(true);
    try {
      const response = await axiosInstance.get(url, {
        responseType: "blob",
        // Override default transform — we need raw blob
        transformResponse: [(data) => data],
      });
      const blob = new Blob([response], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast.success("ดาวน์โหลด PDF สำเร็จ");
    } catch {
      toast.error("ไม่สามารถดาวน์โหลด PDF ได้");
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    isDownloading,
    downloadPO:    (id) => download(endpoints.pdf.purchaseOrder(id),  `PO-${id}.pdf`),
    downloadGR:    (id) => download(endpoints.pdf.goodsReceipt(id),   `GR-${id}.pdf`),
    downloadIssue: (id) => download(endpoints.pdf.materialIssue(id),  `Issue-${id}.pdf`),
  };
}
