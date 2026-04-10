import * as pdfService from "./pdf.service.js";

const sendPdf = (res, buffer, filename) => {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Length", buffer.length);
  res.end(buffer);
};

export const downloadPO = async (req, res, next) => {
  try {
    const buffer = await pdfService.generatePOPdf(req.params.id);
    sendPdf(res, buffer, `purchase-order-${req.params.id}.pdf`);
  } catch (e) { next(e); }
};

export const downloadMaterialIssue = async (req, res, next) => {
  try {
    const buffer = await pdfService.generateMaterialIssuePdf(req.params.id);
    sendPdf(res, buffer, `material-issue-${req.params.id}.pdf`);
  } catch (e) { next(e); }
};

export const downloadGoodsReceipt = async (req, res, next) => {
  try {
    const buffer = await pdfService.generateGoodsReceiptPdf(req.params.id);
    sendPdf(res, buffer, `goods-receipt-${req.params.id}.pdf`);
  } catch (e) { next(e); }
};
