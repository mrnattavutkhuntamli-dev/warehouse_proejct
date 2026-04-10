import prisma from "../../config/prisma.js";
import { AppError } from "../../middleware/errorMiddleware.js";

/**
 * Barcode / QR Code Strategy
 * ---------------------------
 * เราเก็บ barcodeData (string) ใน payload ของแต่ละ entity แทนที่จะเพิ่ม field ใน DB
 * เพราะ schema ปัจจุบันไม่มี barcode field
 *
 * Format ที่ใช้:
 *   Material  → "MAT:{material.code}"
 *   Location  → "LOC:{location.code}"
 *   Tool      → "TOOL:{tool.code}"
 *
 * ฝั่ง Mobile ส่ง barcodeData มา → API resolve กลับเป็น entity
 * ฝั่ง API generate QR payload (SVG string) ให้ render ใน client
 *
 * Library ที่ใช้: `qrcode` (QR Code SVG) + `jsbarcode` น้ำหนักเบา
 * แต่เพื่อไม่ต้องติดตั้ง dependency เพิ่ม เราสร้าง payload string
 * และส่งให้ frontend render ด้วย library ที่ชอบ
 */

// ── GENERATE BARCODE DATA ─────────────────────────────────────────────────────

export const getMaterialBarcode = async (id) => {
  const material = await prisma.material.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!material) throw new AppError("Material not found", 404);

  return buildBarcodePayload("MAT", material.code, {
    type: "material",
    id: material.id,
    code: material.code,
    name: material.name,
    unit: material.unit,
    category: material.category.name,
  });
};

export const getLocationBarcode = async (id) => {
  const location = await prisma.warehouseLocation.findUnique({
    where: { id },
    include: { warehouse: true },
  });
  if (!location) throw new AppError("Location not found", 404);

  return buildBarcodePayload("LOC", location.code, {
    type: "location",
    id: location.id,
    code: location.code,
    description: location.description,
    warehouse: location.warehouse.name,
    warehouseCode: location.warehouse.code,
  });
};

export const getToolBarcode = async (id) => {
  const tool = await prisma.tool.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!tool) throw new AppError("Tool not found", 404);

  return buildBarcodePayload("TOOL", tool.code, {
    type: "tool",
    id: tool.id,
    code: tool.code,
    name: tool.name,
    serialNumber: tool.serialNumber,
    status: tool.status,
    condition: tool.condition,
    category: tool.category.name,
  });
};

// ── SCAN / RESOLVE ─────────────────────────────────────────────────────────────

/**
 * รับ barcodeData จาก scanner แล้ว resolve กลับเป็น entity
 * barcodeData format: "MAT:MTL-001" | "LOC:A-01-01" | "TOOL:TOOL-001"
 */
export const resolveScan = async (barcodeData) => {
  if (!barcodeData || typeof barcodeData !== "string") {
    throw new AppError("Invalid barcode data", 400);
  }

  const parts = barcodeData.trim().split(":");
  if (parts.length < 2) throw new AppError("Unrecognized barcode format", 400);

  const [prefix, ...rest] = parts;
  const code = rest.join(":");

  switch (prefix.toUpperCase()) {
    case "MAT": {
      const material = await prisma.material.findUnique({
        where: { code },
        include: {
          category: true,
          stocks: {
            include: {
              location: { include: { warehouse: { select: { id: true, name: true } } } },
            },
          },
        },
      });
      if (!material) throw new AppError(`Material with code "${code}" not found`, 404);
      return {
        resolvedType: "material",
        barcodeData,
        entity: {
          ...material,
          totalStock: material.stocks.reduce((sum, s) => sum + Number(s.quantity), 0),
        },
      };
    }

    case "LOC": {
      const location = await prisma.warehouseLocation.findUnique({
        where: { code },
        include: {
          warehouse: true,
          stocks: {
            include: { material: { select: { id: true, code: true, name: true, unit: true } } },
          },
        },
      });
      if (!location) throw new AppError(`Location with code "${code}" not found`, 404);
      return { resolvedType: "location", barcodeData, entity: location };
    }

    case "TOOL": {
      const tool = await prisma.tool.findUnique({
        where: { code },
        include: {
          category: true,
          location: { include: { warehouse: { select: { id: true, name: true } } } },
          borrowRecords: {
            where: { returnedAt: null },
            include: { borrower: { select: { id: true, name: true, employeeCode: true } } },
            take: 1,
          },
        },
      });
      if (!tool) throw new AppError(`Tool with code "${code}" not found`, 404);
      return {
        resolvedType: "tool",
        barcodeData,
        entity: {
          ...tool,
          currentBorrower: tool.borrowRecords[0]?.borrower ?? null,
        },
      };
    }

    default:
      throw new AppError(`Unknown barcode prefix "${prefix}"`, 400);
  }
};

// ── BULK GENERATE (for printing label sheets) ─────────────────────────────────

export const getBulkBarcodes = async ({ type, ids }) => {
  switch (type) {
    case "material": {
      const materials = await prisma.material.findMany({
        where: ids ? { id: { in: ids } } : { isActive: true },
        include: { category: true },
        orderBy: { code: "asc" },
      });
      return materials.map((m) =>
        buildBarcodePayload("MAT", m.code, {
          type: "material", id: m.id, code: m.code, name: m.name, unit: m.unit,
          category: m.category.name,
        })
      );
    }

    case "location": {
      const locations = await prisma.warehouseLocation.findMany({
        where: ids ? { id: { in: ids } } : { isActive: true },
        include: { warehouse: true },
        orderBy: { code: "asc" },
      });
      return locations.map((l) =>
        buildBarcodePayload("LOC", l.code, {
          type: "location", id: l.id, code: l.code,
          description: l.description, warehouse: l.warehouse.name,
        })
      );
    }

    case "tool": {
      const tools = await prisma.tool.findMany({
        where: ids ? { id: { in: ids } } : { isActive: true },
        include: { category: true },
        orderBy: { code: "asc" },
      });
      return tools.map((t) =>
        buildBarcodePayload("TOOL", t.code, {
          type: "tool", id: t.id, code: t.code, name: t.name,
          serialNumber: t.serialNumber, category: t.category.name,
        })
      );
    }

    default:
      throw new AppError("type must be: material | location | tool", 400);
  }
};

// ── HELPER ────────────────────────────────────────────────────────────────────

const buildBarcodePayload = (prefix, code, meta) => ({
  barcodeData: `${prefix}:${code}`,     // string สำหรับ encode เป็น QR / Barcode
  displayCode: code,                    // แสดงใต้ barcode
  label: meta.name ?? meta.code ?? code, // label บน sticker
  meta,                                 // ข้อมูลครบสำหรับ tooltip / preview
  instructions: {
    qr: `Encode "${prefix}:${code}" as QR Code (use qrcode.js or similar)`,
    barcode: `Encode "${code}" as Code128 barcode`,
    scanEndpoint: "POST /api/v1/barcode/scan  body: { barcodeData }",
  },
});
