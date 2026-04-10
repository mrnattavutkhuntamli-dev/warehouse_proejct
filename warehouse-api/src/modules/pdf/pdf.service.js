/**
 * PDF Generator Module
 * ─────────────────────────────────────────────────────────────
 * ใช้ `@playwright/browser` หรือ `puppeteer` สำหรับ HTML→PDF
 * แต่เพื่อไม่ให้หนักเกินไป เราใช้ `pdfkit` ซึ่งเป็น pure JS
 * และสร้าง PDF โดยตรงโดยไม่ต้องมี browser binary
 *
 * ติดตั้ง: npm install pdfkit
 * ─────────────────────────────────────────────────────────────
 */

import PDFDocument from "pdfkit";
import prisma from "../../config/prisma.js";
import { AppError } from "../../middleware/errorMiddleware.js";

const COMPANY_NAME = process.env.COMPANY_NAME || "บริษัท ตัวอย่าง จำกัด";
const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS || "123 ถนนตัวอย่าง กรุงเทพฯ 10100";
const COMPANY_PHONE = process.env.COMPANY_PHONE || "02-000-0000";

// ── HELPERS ────────────────────────────────────────────────────────────────────

const formatDate = (date) =>
  new Date(date).toLocaleDateString("th-TH", {
    year: "numeric", month: "long", day: "numeric",
  });

const formatNumber = (n, decimals = 2) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/**
 * สร้าง PDF Document พื้นฐาน พร้อม header บริษัท
 */
const createDoc = () => {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    bufferPages: true,
  });
  return doc;
};

const drawHeader = (doc, title, docNo, date) => {
  const pageWidth = doc.page.width - 100; // margins

  // Company Name
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text(COMPANY_NAME, 50, 50, { align: "center", width: pageWidth });

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(COMPANY_ADDRESS, 50, 72, { align: "center", width: pageWidth })
    .text(`Tel: ${COMPANY_PHONE}`, { align: "center", width: pageWidth });

  // Divider
  doc.moveTo(50, 105).lineTo(545, 105).strokeColor("#cccccc").stroke();

  // Document Title
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .fillColor("#1a1a2e")
    .text(title, 50, 115, { align: "center", width: pageWidth });

  // Doc No + Date (right side)
  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#333333")
    .text(`Document No: ${docNo}`, 380, 115)
    .text(`Date: ${formatDate(date)}`, 380, 128);

  return 148; // return Y position after header
};

const drawTableHeader = (doc, y, columns) => {
  doc.rect(50, y, 495, 20).fill("#1a1a2e");
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#ffffff");
  let x = 50;
  for (const col of columns) {
    doc.text(col.label, x + 4, y + 5, { width: col.width - 8, align: col.align || "left" });
    x += col.width;
  }
  doc.fillColor("#333333").font("Helvetica").fontSize(9);
  return y + 20;
};

const drawTableRow = (doc, y, columns, values, isEven) => {
  if (isEven) doc.rect(50, y, 495, 18).fill("#f8f9fa").fillColor("#333333");
  let x = 50;
  for (let i = 0; i < columns.length; i++) {
    doc.text(String(values[i] ?? ""), x + 4, y + 4, {
      width: columns[i].width - 8,
      align: columns[i].align || "left",
    });
    x += columns[i].width;
  }
  doc.moveTo(50, y + 18).lineTo(545, y + 18).strokeColor("#e0e0e0").stroke();
  return y + 18;
};

const drawFooter = (doc, note) => {
  const bottom = doc.page.height - 100;
  doc.moveTo(50, bottom).lineTo(545, bottom).strokeColor("#cccccc").stroke();

  if (note) {
    doc.fontSize(9).font("Helvetica").fillColor("#555555")
      .text(`Note: ${note}`, 50, bottom + 8, { width: 300 });
  }

  // Signature boxes
  const sigY = bottom + 10;
  doc.fontSize(9).font("Helvetica").fillColor("#333333");

  const sigBoxes = [
    { label: "Prepared by", x: 50 },
    { label: "Approved by", x: 200 },
    { label: "Received by", x: 380 },
  ];

  for (const box of sigBoxes) {
    doc.text(box.label, box.x, sigY)
       .moveTo(box.x, sigY + 30).lineTo(box.x + 120, sigY + 30)
       .strokeColor("#aaaaaa").stroke()
       .text("____________________", box.x, sigY + 32, { width: 120 })
       .text("Date: ____________", box.x, sigY + 45, { width: 120 });
  }
};

const addPageNumber = (doc) => {
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(pages.start + i);
    doc.fontSize(8).fillColor("#888888")
       .text(`Page ${i + 1} of ${pages.count}`, 50, doc.page.height - 20, {
         align: "center", width: doc.page.width - 100,
       });
  }
};

// ── PURCHASE ORDER PDF ─────────────────────────────────────────────────────────

export const generatePOPdf = async (id) => {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      creator: { select: { name: true, employeeCode: true } },
      items: {
        include: { material: { select: { code: true, name: true, unit: true } } },
      },
    },
  });
  if (!po) throw new AppError("Purchase order not found", 404);

  const doc = createDoc();
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  // Header
  let y = drawHeader(doc, "PURCHASE ORDER", po.poNumber, po.createdAt);

  // PO Info Box
  y += 10;
  doc.rect(50, y, 495, 65).strokeColor("#dddddd").stroke();

  doc.fontSize(9).font("Helvetica-Bold").fillColor("#333333")
     .text("Supplier Information", 60, y + 8);
  doc.font("Helvetica")
     .text(`Name: ${po.supplier.name}`, 60, y + 20)
     .text(`Code: ${po.supplier.code}`, 60, y + 32)
     .text(`Contact: ${po.supplier.contact || "-"}`, 60, y + 44)
     .text(`Phone: ${po.supplier.phone || "-"}`, 60, y + 56);

  doc.font("Helvetica-Bold").text("Order Info", 310, y + 8);
  doc.font("Helvetica")
     .text(`PO Number: ${po.poNumber}`, 310, y + 20)
     .text(`Status: ${po.status}`, 310, y + 32)
     .text(`Created by: ${po.creator.name}`, 310, y + 44)
     .text(`Created at: ${formatDate(po.createdAt)}`, 310, y + 56);

  y += 75;

  // Items Table
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#1a1a2e")
     .text("Order Items", 50, y);
  y += 14;

  const columns = [
    { label: "#", width: 25, align: "center" },
    { label: "Material Code", width: 90 },
    { label: "Material Name", width: 170 },
    { label: "Unit", width: 50, align: "center" },
    { label: "Qty", width: 60, align: "right" },
    { label: "Unit Price", width: 60, align: "right" },
    { label: "Total", width: 70, align: "right" },
  ];

  y = drawTableHeader(doc, y, columns);

  let grandTotal = 0;
  po.items.forEach((item, idx) => {
    const total = Number(item.quantity) * Number(item.unitPrice);
    grandTotal += total;

    // New page if needed
    if (y > doc.page.height - 150) {
      doc.addPage();
      y = 50;
      y = drawTableHeader(doc, y, columns);
    }

    y = drawTableRow(doc, y, columns, [
      idx + 1,
      item.material.code,
      item.material.name,
      item.material.unit,
      formatNumber(item.quantity, 0),
      formatNumber(item.unitPrice),
      formatNumber(total),
    ], idx % 2 === 1);
  });

  // Grand Total
  y += 8;
  doc.rect(380, y, 165, 22).fill("#1a1a2e");
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#ffffff")
     .text("GRAND TOTAL:", 384, y + 6, { width: 80 })
     .text(formatNumber(grandTotal), 384, y + 6, { width: 157, align: "right" });

  // Note
  if (po.note) {
    y += 32;
    doc.fontSize(9).font("Helvetica").fillColor("#555555")
       .text(`Remark: ${po.note}`, 50, y);
  }

  drawFooter(doc, po.note);
  addPageNumber(doc);
  doc.end();

  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
};

// ── MATERIAL ISSUE PDF ─────────────────────────────────────────────────────────

export const generateMaterialIssuePdf = async (id) => {
  const issue = await prisma.materialIssue.findUnique({
    where: { id },
    include: {
      requester: { select: { name: true, employeeCode: true, department: { select: { name: true } } } },
      approver: { select: { name: true } },
      items: {
        include: {
          material: { select: { code: true, name: true, unit: true } },
          location: { include: { warehouse: { select: { name: true } } } },
        },
      },
    },
  });
  if (!issue) throw new AppError("Material issue not found", 404);

  const doc = createDoc();
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  let y = drawHeader(doc, "MATERIAL ISSUE REQUEST", issue.issueNo, issue.createdAt);

  // Issue Info Box
  y += 10;
  doc.rect(50, y, 495, 55).strokeColor("#dddddd").stroke();

  doc.fontSize(9).font("Helvetica-Bold").fillColor("#333333")
     .text("Requester Information", 60, y + 8);
  doc.font("Helvetica")
     .text(`Name: ${issue.requester.name}`, 60, y + 20)
     .text(`Employee Code: ${issue.requester.employeeCode}`, 60, y + 32)
     .text(`Department: ${issue.requester.department?.name || "-"}`, 60, y + 44);

  doc.font("Helvetica-Bold").text("Issue Info", 310, y + 8);
  doc.font("Helvetica")
     .text(`Issue No: ${issue.issueNo}`, 310, y + 20)
     .text(`Status: ${issue.status}`, 310, y + 32)
     .text(`Approved by: ${issue.approver?.name || "Pending"}`, 310, y + 44);

  y += 65;

  // Purpose
  if (issue.purpose) {
    doc.fontSize(9).font("Helvetica").fillColor("#333333")
       .text(`Purpose: ${issue.purpose}`, 50, y);
    y += 16;
  }

  // Items Table
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#1a1a2e")
     .text("Requested Materials", 50, y);
  y += 14;

  const columns = [
    { label: "#", width: 25, align: "center" },
    { label: "Material Code", width: 90 },
    { label: "Material Name", width: 170 },
    { label: "Unit", width: 50, align: "center" },
    { label: "Quantity", width: 70, align: "right" },
    { label: "Location", width: 90 },
  ];

  y = drawTableHeader(doc, y, columns);

  issue.items.forEach((item, idx) => {
    if (y > doc.page.height - 150) {
      doc.addPage();
      y = 50;
      y = drawTableHeader(doc, y, columns);
    }

    y = drawTableRow(doc, y, columns, [
      idx + 1,
      item.material.code,
      item.material.name,
      item.material.unit,
      formatNumber(item.quantity, 0),
      `${item.location.warehouse.name} / ${item.location.code}`,
    ], idx % 2 === 1);
  });

  // Summary
  y += 8;
  const totalItems = issue.items.length;
  doc.fontSize(9).font("Helvetica").fillColor("#555555")
     .text(`Total: ${totalItems} item(s)`, 50, y);

  drawFooter(doc, issue.purpose);
  addPageNumber(doc);
  doc.end();

  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
};

// ── GOODS RECEIPT PDF ──────────────────────────────────────────────────────────

export const generateGoodsReceiptPdf = async (id) => {
  const gr = await prisma.goodsReceipt.findUnique({
    where: { id },
    include: {
      supplier: true,
      receiver: { select: { name: true, employeeCode: true } },
      purchaseOrder: { select: { poNumber: true } },
      items: {
        include: {
          material: { select: { code: true, name: true, unit: true } },
          location: { include: { warehouse: { select: { name: true } } } },
        },
      },
    },
  });
  if (!gr) throw new AppError("Goods receipt not found", 404);

  const doc = createDoc();
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  let y = drawHeader(doc, "GOODS RECEIPT", gr.receiptNo, gr.receivedAt);

  // GR Info Box
  y += 10;
  doc.rect(50, y, 495, 55).strokeColor("#dddddd").stroke();
  doc.fontSize(9).font("Helvetica-Bold").fillColor("#333333")
     .text("Supplier", 60, y + 8);
  doc.font("Helvetica")
     .text(`Name: ${gr.supplier.name}`, 60, y + 20)
     .text(`Code: ${gr.supplier.code}`, 60, y + 32)
     .text(`Phone: ${gr.supplier.phone || "-"}`, 60, y + 44);

  doc.font("Helvetica-Bold").text("Receipt Info", 310, y + 8);
  doc.font("Helvetica")
     .text(`Receipt No: ${gr.receiptNo}`, 310, y + 20)
     .text(`PO Ref: ${gr.purchaseOrder?.poNumber || "-"}`, 310, y + 32)
     .text(`Received by: ${gr.receiver.name}`, 310, y + 44);

  y += 65;

  // Items Table
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#1a1a2e")
     .text("Received Items", 50, y);
  y += 14;

  const columns = [
    { label: "#", width: 25, align: "center" },
    { label: "Material Code", width: 90 },
    { label: "Material Name", width: 155 },
    { label: "Unit", width: 45, align: "center" },
    { label: "Qty", width: 55, align: "right" },
    { label: "Unit Price", width: 60, align: "right" },
    { label: "Total", width: 65, align: "right" },
  ];

  y = drawTableHeader(doc, y, columns);

  let grandTotal = 0;
  gr.items.forEach((item, idx) => {
    if (y > doc.page.height - 150) {
      doc.addPage();
      y = 50;
      y = drawTableHeader(doc, y, columns);
    }
    const total = Number(item.quantity) * Number(item.unitPrice);
    grandTotal += total;
    y = drawTableRow(doc, y, columns, [
      idx + 1,
      item.material.code,
      item.material.name,
      item.material.unit,
      formatNumber(item.quantity, 0),
      formatNumber(item.unitPrice),
      formatNumber(total),
    ], idx % 2 === 1);
  });

  y += 8;
  doc.rect(380, y, 165, 22).fill("#1a1a2e");
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#ffffff")
     .text("GRAND TOTAL:", 384, y + 6, { width: 80 })
     .text(formatNumber(grandTotal), 384, y + 6, { width: 157, align: "right" });

  drawFooter(doc, gr.note);
  addPageNumber(doc);
  doc.end();

  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
};
