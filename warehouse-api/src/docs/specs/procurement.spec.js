const procurementSpec = {
  // ── PURCHASE ORDERS ────────────────────────────────────────────────────────
  "/procurement/purchase-orders": {
    get: {
      tags: ["Procurement"],
      summary: "List ใบสั่งซื้อทั้งหมด",
      description: "ดึงรายการ Purchase Order พร้อม pagination กรองตาม status หรือ supplier ได้",
      parameters: [
        { $ref: "#/components/parameters/PageParam" },
        { $ref: "#/components/parameters/LimitParam" },
        {
          name: "status",
          in: "query",
          schema: { $ref: "#/components/schemas/PurchaseOrderStatus" },
          description: "กรองตามสถานะ PO",
        },
        {
          name: "supplierId",
          in: "query",
          schema: { $ref: "#/components/schemas/UUID" },
          description: "กรองตาม supplier",
        },
      ],
      responses: {
        200: {
          description: "รายการ PO",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { type: "array", items: { $ref: "#/components/schemas/PurchaseOrder" } },
                  pagination: { $ref: "#/components/schemas/PaginationMeta" },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
    post: {
      tags: ["Procurement"],
      summary: "สร้างใบสั่งซื้อใหม่ (PO)",
      description: `สร้าง Purchase Order ใหม่พร้อม items — auto-generate poNumber

**Status เริ่มต้น:** DRAFT

**Role ที่ต้องการ:** ADMIN, MANAGER, STAFF

**Audit:** บันทึก AuditLog ทุกครั้งที่สร้าง`,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["supplierId", "items"],
              properties: {
                supplierId: { $ref: "#/components/schemas/UUID" },
                note: { type: "string", example: "สั่งด่วน กรุณาส่งภายใน 7 วัน" },
                items: {
                  type: "array",
                  minItems: 1,
                  items: {
                    type: "object",
                    required: ["materialId", "quantity", "unitPrice"],
                    properties: {
                      materialId: { $ref: "#/components/schemas/UUID" },
                      quantity: { type: "number", minimum: 0.01, example: 50 },
                      unitPrice: { type: "number", minimum: 0, example: 250.00 },
                    },
                  },
                },
              },
            },
            example: {
              supplierId: "550e8400-e29b-41d4-a716-446655440000",
              note: "สั่งประจำเดือน",
              items: [
                { materialId: "uuid-material-1", quantity: 100, unitPrice: 250 },
                { materialId: "uuid-material-2", quantity: 50, unitPrice: 1200 },
              ],
            },
          },
        },
      },
      responses: {
        201: {
          description: "สร้าง PO สำเร็จ",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Purchase order created" },
                  data: { $ref: "#/components/schemas/PurchaseOrder" },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { description: "ไม่พบ Supplier หรือ Material", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
  },
  "/procurement/purchase-orders/{id}": {
    get: {
      tags: ["Procurement"],
      summary: "รายละเอียด PO",
      description: "ดูรายละเอียด PO ทั้งหมด รวม items, supplier, ผู้สร้าง, ผู้อนุมัติ",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: {
        200: {
          description: "รายละเอียด PO",
          content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/PurchaseOrder" } } } } },
        },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/procurement/purchase-orders/{id}/status": {
    patch: {
      tags: ["Procurement"],
      summary: "เปลี่ยนสถานะ PO",
      description: `อนุมัติหรือยกเลิก Purchase Order

**กฎ:** เปลี่ยนได้เฉพาะ PO ที่มี status = DRAFT เท่านั้น

**Status Flow:**
\`\`\`
DRAFT → APPROVED   (อนุมัติ บันทึก approvedBy + approvedAt)
DRAFT → CANCELLED  (ยกเลิก)
\`\`\`

**Optimistic Locking:** ส่ง \`version\` (updatedAt ISO string) มาด้วยเพื่อป้องกัน concurrent update หากมีการแก้ไขก่อนหน้า จะได้รับ HTTP 409

**Role ที่ต้องการ:** ADMIN, MANAGER

**Audit:** บันทึก AuditLog ทุกครั้ง`,
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["status"],
              properties: {
                status: {
                  type: "string",
                  enum: ["APPROVED", "CANCELLED"],
                  example: "APPROVED",
                },
                version: {
                  type: "string",
                  format: "date-time",
                  description: "(Optional) updatedAt ของ PO ที่ client อ่านมาล่าสุด ใช้สำหรับ Optimistic Lock",
                  example: "2024-06-01T10:30:00.000Z",
                },
              },
            },
            examples: {
              approve: { summary: "อนุมัติ (พร้อม version lock)", value: { status: "APPROVED", version: "2024-06-01T10:30:00.000Z" } },
              cancel: { summary: "ยกเลิก", value: { status: "CANCELLED" } },
            },
          },
        },
      },
      responses: {
        200: { description: "เปลี่ยนสถานะสำเร็จ", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/PurchaseOrder" } } } } } },
        400: { description: "PO ไม่ได้อยู่ใน DRAFT หรือ status ไม่ถูกต้อง" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
        409: { $ref: "#/components/responses/Conflict" },
      },
    },
  },

  // ── GOODS RECEIPTS ─────────────────────────────────────────────────────────
  "/procurement/goods-receipts": {
    get: {
      tags: ["Procurement"],
      summary: "List ใบรับสินค้าทั้งหมด",
      parameters: [
        { $ref: "#/components/parameters/PageParam" },
        { $ref: "#/components/parameters/LimitParam" },
        { name: "supplierId", in: "query", schema: { $ref: "#/components/schemas/UUID" } },
        { name: "poId", in: "query", schema: { $ref: "#/components/schemas/UUID" }, description: "กรองตาม Purchase Order" },
      ],
      responses: {
        200: {
          description: "รายการใบรับสินค้า",
          content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/GoodsReceipt" } }, pagination: { $ref: "#/components/schemas/PaginationMeta" } } } } },
        },
      },
    },
    post: {
      tags: ["Procurement"],
      summary: "รับสินค้าเข้าคลัง (GR)",
      description: `บันทึกการรับสินค้า — ทำงานหลายอย่างพร้อมกันใน transaction เดียว:

1. **สร้าง GoodsReceipt** พร้อม items
2. **เพิ่มสต็อก** แต่ละ item ด้วย **Pessimistic Lock** (SELECT FOR UPDATE)
3. **สร้าง StockTransaction** ประเภท \`IN\`
4. **อัปเดต receivedQty** ใน PurchaseOrderItem (ถ้าระบุ poId)
5. **เปลี่ยน PO status** → PARTIAL_RECEIVED หรือ RECEIVED อัตโนมัติ
6. **บันทึก AuditLog**

**Role ที่ต้องการ:** ADMIN, MANAGER, STAFF`,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["supplierId", "items"],
              properties: {
                supplierId: { $ref: "#/components/schemas/UUID" },
                poId: {
                  allOf: [{ $ref: "#/components/schemas/UUID" }],
                  nullable: true,
                  description: "อ้างอิง PO (ถ้ามี) จะอัปเดต receivedQty และ PO status อัตโนมัติ",
                },
                note: { type: "string", example: "รับสินค้าครบตาม PO" },
                items: {
                  type: "array",
                  minItems: 1,
                  items: {
                    type: "object",
                    required: ["materialId", "locationId", "quantity", "unitPrice"],
                    properties: {
                      materialId: { $ref: "#/components/schemas/UUID" },
                      locationId: { $ref: "#/components/schemas/UUID", description: "ตำแหน่งที่จะเก็บสินค้า" },
                      quantity: { type: "number", minimum: 0.01, example: 50 },
                      unitPrice: { type: "number", minimum: 0, example: 250.00 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "รับสินค้าสำเร็จ stock อัปเดตแล้ว", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/GoodsReceipt" } } } } } },
        400: { $ref: "#/components/responses/ValidationError" },
        404: { description: "ไม่พบ Supplier, Material หรือ Location" },
      },
    },
  },
  "/procurement/goods-receipts/{id}": {
    get: {
      tags: ["Procurement"],
      summary: "รายละเอียดใบรับสินค้า",
      description: "ดูรายละเอียด GR พร้อม items, supplier, PO อ้างอิง, warehouse ของแต่ละ location",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: {
        200: { description: "รายละเอียด GR", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/GoodsReceipt" } } } } } },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },

  // ── MATERIAL ISSUES ────────────────────────────────────────────────────────
  "/procurement/material-issues": {
    get: {
      tags: ["Procurement"],
      summary: "List ใบเบิกวัสดุทั้งหมด",
      parameters: [
        { $ref: "#/components/parameters/PageParam" },
        { $ref: "#/components/parameters/LimitParam" },
        { name: "status", in: "query", schema: { $ref: "#/components/schemas/MaterialIssueStatus" } },
        { name: "requestedBy", in: "query", schema: { $ref: "#/components/schemas/UUID" }, description: "กรองตามผู้เบิก" },
      ],
      responses: {
        200: {
          description: "รายการใบเบิกวัสดุ",
          content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/MaterialIssue" } }, pagination: { $ref: "#/components/schemas/PaginationMeta" } } } } },
        },
      },
    },
    post: {
      tags: ["Procurement"],
      summary: "สร้างใบเบิกวัสดุ",
      description: `สร้างใบเบิกวัสดุใหม่ — status เริ่มต้นเป็น DRAFT รอการอนุมัติ

**หมายเหตุ:** การสร้างใบเบิกยังไม่หัก stock — stock จะถูกหักเมื่อเปลี่ยน status เป็น ISSUED เท่านั้น

**Audit:** บันทึก AuditLog`,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["items"],
              properties: {
                purpose: { type: "string", example: "งานซ่อมบำรุงเครื่องจักรสาย A" },
                items: {
                  type: "array",
                  minItems: 1,
                  items: {
                    type: "object",
                    required: ["materialId", "locationId", "quantity"],
                    properties: {
                      materialId: { $ref: "#/components/schemas/UUID" },
                      locationId: { $ref: "#/components/schemas/UUID", description: "location ที่ต้องการเบิก" },
                      quantity: { type: "number", minimum: 0.01, example: 5 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "สร้างใบเบิกสำเร็จ", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/MaterialIssue" } } } } } },
        400: { $ref: "#/components/responses/ValidationError" },
      },
    },
  },
  "/procurement/material-issues/{id}": {
    get: {
      tags: ["Procurement"],
      summary: "รายละเอียดใบเบิกวัสดุ",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: {
        200: { description: "รายละเอียดใบเบิก + items + location + warehouse", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/MaterialIssue" } } } } } },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/procurement/material-issues/{id}/status": {
    patch: {
      tags: ["Procurement"],
      summary: "เปลี่ยนสถานะใบเบิกวัสดุ",
      description: `เปลี่ยนสถานะใบเบิก — มีการป้องกัน Concurrency หลายชั้น

**Status Flow:**
\`\`\`
DRAFT → APPROVED   (อนุมัติ บันทึก approvedBy)
DRAFT → CANCELLED  (ยกเลิก)
APPROVED → ISSUED  (จ่ายวัสดุจริง ⚡ หัก stock)
APPROVED → CANCELLED
\`\`\`

**เมื่อ status = ISSUED จะทำงานดังนี้:**
1. **In-memory Mutex** — ป้องกัน 2 request สำหรับ issue เดียวกันเข้าพร้อมกัน → HTTP 429
2. **Optimistic Lock** — ตรวจ version ป้องกัน stale data → HTTP 409
3. **Pessimistic Lock** (SELECT FOR UPDATE) — lock stock row ก่อนหัก
4. ตรวจสต็อกเพียงพอหลัง lock → HTTP 400 ถ้าไม่พอ
5. หักสต็อกแต่ละ item และสร้าง StockTransaction(OUT)
6. บันทึก AuditLog

**Role ที่ต้องการ:** ADMIN, MANAGER`,
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["status"],
              properties: {
                status: {
                  type: "string",
                  enum: ["APPROVED", "ISSUED", "CANCELLED"],
                  example: "ISSUED",
                },
                version: {
                  type: "string",
                  format: "date-time",
                  description: "(Optional) updatedAt ของ issue — ใช้สำหรับ Optimistic Lock",
                  example: "2024-06-01T14:00:00.000Z",
                },
              },
            },
            examples: {
              approve: { summary: "อนุมัติ", value: { status: "APPROVED" } },
              issue: { summary: "จ่ายวัสดุ (พร้อม version lock)", value: { status: "ISSUED", version: "2024-06-01T14:00:00.000Z" } },
              cancel: { summary: "ยกเลิก", value: { status: "CANCELLED" } },
            },
          },
        },
      },
      responses: {
        200: { description: "เปลี่ยนสถานะสำเร็จ stock อัปเดตแล้ว (กรณี ISSUED)" },
        400: { description: "สต็อกไม่เพียงพอ หรือ status ไม่ถูกต้อง" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
        409: { $ref: "#/components/responses/Conflict" },
        429: { description: "มี request อื่นกำลังประมวลผล issue นี้อยู่ กรุณาลองใหม่", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" }, example: { success: false, message: "Another operation is currently processing this resource." } } } },
      },
    },
  },
};

export default procurementSpec;
