const stockSpec = {
  "/stock": {
    get: {
      tags: ["Stock"],
      summary: "ยอดสต็อกปัจจุบัน",
      description: "ดูยอดสต็อกปัจจุบันของวัสดุแต่ละชิ้นในแต่ละ location พร้อมข้อมูล warehouse",
      parameters: [
        { $ref: "#/components/parameters/PageParam" },
        { $ref: "#/components/parameters/LimitParam" },
        { name: "materialId", in: "query", schema: { $ref: "#/components/schemas/UUID" }, description: "กรองตามวัสดุ" },
        { name: "locationId", in: "query", schema: { $ref: "#/components/schemas/UUID" }, description: "กรองตาม location" },
      ],
      responses: {
        200: {
          description: "ยอดสต็อก",
          content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Stock" } }, pagination: { $ref: "#/components/schemas/PaginationMeta" } } } } },
        },
      },
    },
  },
  "/stock/transactions": {
    get: {
      tags: ["Stock"],
      summary: "ประวัติ Stock Transaction ทั้งหมด",
      description: "ดูประวัติการเคลื่อนไหวของสต็อก กรองตามวัสดุ location หรือประเภท",
      parameters: [
        { $ref: "#/components/parameters/PageParam" },
        { $ref: "#/components/parameters/LimitParam" },
        { name: "materialId", in: "query", schema: { $ref: "#/components/schemas/UUID" } },
        { name: "locationId", in: "query", schema: { $ref: "#/components/schemas/UUID" } },
        { name: "type", in: "query", schema: { $ref: "#/components/schemas/TransactionType" }, description: "ประเภท transaction" },
      ],
      responses: {
        200: { description: "รายการ transactions", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/StockTransaction" } }, pagination: { $ref: "#/components/schemas/PaginationMeta" } } } } } },
      },
    },
    post: {
      tags: ["Stock"],
      summary: "สร้าง Stock Transaction (manual)",
      description: `สร้าง transaction ปรับยอดสต็อกด้วยตัวเอง อัปเดต stock อัตโนมัติ

**ผลต่อ Stock:**
- \`IN\`, \`RETURN\` → บวก stock
- \`OUT\`, \`TRANSFER\`, \`ADJUST\` → ลด stock

**Role ที่ต้องการ: ADMIN, MANAGER, STAFF**`,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["materialId", "type", "quantity"],
              properties: {
                materialId: { $ref: "#/components/schemas/UUID" },
                locationId: { $ref: "#/components/schemas/UUID" },
                type: { $ref: "#/components/schemas/TransactionType" },
                quantity: { type: "number", minimum: 0.01, example: 20 },
                referenceId: { type: "string", description: "UUID ของเอกสารอ้างอิง (optional)" },
                note: { type: "string", example: "ปรับยอดหลังนับสต็อก" },
              },
            },
            examples: {
              stockIn: { summary: "รับเข้า", value: { materialId: "uuid", locationId: "uuid", type: "IN", quantity: 50, note: "รับเพิ่มเติมจาก supplier" } },
              adjust: { summary: "ปรับยอด", value: { materialId: "uuid", locationId: "uuid", type: "ADJUST", quantity: 5, note: "ปรับยอดหลังนับสต็อก" } },
            },
          },
        },
      },
      responses: { 201: { description: "สร้าง transaction สำเร็จ stock อัปเดตแล้ว" }, 400: { $ref: "#/components/responses/ValidationError" } },
    },
  },
  "/stock/counts": {
    get: {
      tags: ["Stock"],
      summary: "List การนับสต็อกทั้งหมด",
      parameters: [
        { $ref: "#/components/parameters/PageParam" },
        { $ref: "#/components/parameters/LimitParam" },
        { name: "warehouseId", in: "query", schema: { $ref: "#/components/schemas/UUID" } },
        { name: "status", in: "query", schema: { $ref: "#/components/schemas/StockCountStatus" } },
      ],
      responses: {
        200: { description: "รายการนับสต็อก", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/StockCount" } }, pagination: { $ref: "#/components/schemas/PaginationMeta" } } } } } },
      },
    },
    post: {
      tags: ["Stock"],
      summary: "สร้างการนับสต็อกใหม่",
      description: "สร้างใบนับสต็อก (countNo auto-gen) พร้อม items เปรียบเทียบ systemQty vs countedQty **Role: ADMIN, MANAGER, STAFF**",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["warehouseId", "items"],
              properties: {
                warehouseId: { $ref: "#/components/schemas/UUID" },
                note: { type: "string", example: "นับสต็อกประจำเดือน" },
                items: {
                  type: "array",
                  minItems: 1,
                  items: {
                    type: "object",
                    required: ["materialId", "locationId", "systemQty", "countedQty"],
                    properties: {
                      materialId: { $ref: "#/components/schemas/UUID" },
                      locationId: { $ref: "#/components/schemas/UUID" },
                      systemQty: { type: "number", example: 150, description: "ยอดในระบบ" },
                      countedQty: { type: "number", example: 148, description: "ยอดที่นับได้จริง" },
                      note: { type: "string", example: "พบความแตกต่าง 2 ชิ้น" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: { 201: { description: "สร้างการนับสต็อกสำเร็จ" } },
    },
  },
  "/stock/counts/{id}": {
    get: {
      tags: ["Stock"],
      summary: "รายละเอียดการนับสต็อก",
      description: "ดูรายการ items ทั้งหมดพร้อมเปรียบเทียบ systemQty vs countedQty และ variance",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: {
        200: {
          description: "รายละเอียดการนับ",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    allOf: [
                      { $ref: "#/components/schemas/StockCount" },
                      { type: "object", properties: { items: { type: "array", items: { type: "object", properties: { material: { $ref: "#/components/schemas/Material" }, location: { $ref: "#/components/schemas/WarehouseLocation" }, systemQty: { type: "number" }, countedQty: { type: "number" }, note: { type: "string" } } } } } },
                    ],
                  },
                },
              },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    put: {
      tags: ["Stock"],
      summary: "อัปเดตการนับสต็อก / เปลี่ยน status",
      description: `อัปเดตข้อมูลการนับ หรือเปลี่ยน status

**Status Flow:** DRAFT → COUNTING → COMPLETED (ล็อคแก้ไขหลัง COMPLETED)

**Role: ADMIN, MANAGER, STAFF**`,
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                status: { $ref: "#/components/schemas/StockCountStatus" },
                note: { type: "string" },
                items: { type: "array", items: { type: "object", properties: { materialId: { $ref: "#/components/schemas/UUID" }, locationId: { $ref: "#/components/schemas/UUID" }, systemQty: { type: "number" }, countedQty: { type: "number" }, note: { type: "string" } } } },
              },
            },
          },
        },
      },
      responses: { 200: { description: "อัปเดตสำเร็จ" }, 400: { description: "ไม่สามารถแก้ไข COMPLETED stock count" } },
    },
  },
};

export default stockSpec;
