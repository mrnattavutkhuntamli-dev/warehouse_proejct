const toolSpec = {
  // ── TOOL CATEGORIES ────────────────────────────────────────────────────────
  "/tools/categories": {
    get: {
      tags: ["Tools"],
      summary: "List หมวดหมู่เครื่องมือ",
      description: "ดึงหมวดหมู่ทั้งหมดพร้อมจำนวนเครื่องมือในแต่ละหมวด",
      responses: {
        200: {
          description: "รายการหมวดหมู่",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { data: { type: "array", items: { $ref: "#/components/schemas/ToolCategory" } } },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
    post: {
      tags: ["Tools"],
      summary: "สร้างหมวดหมู่เครื่องมือ",
      description: "**Role ที่ต้องการ: ADMIN, MANAGER**",
      requestBody: {
        required: true,
        content: { "application/json": { schema: { type: "object", required: ["name"], properties: { name: { type: "string", example: "เครื่องมือวัด" } } } } },
      },
      responses: { 201: { description: "สร้างสำเร็จ" }, 409: { description: "ชื่อหมวดหมู่ซ้ำ" } },
    },
  },
  "/tools/categories/{id}": {
    put: {
      tags: ["Tools"],
      summary: "แก้ไขหมวดหมู่เครื่องมือ",
      description: "**Role ที่ต้องการ: ADMIN, MANAGER**",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name"], properties: { name: { type: "string" } } } } } },
      responses: { 200: { description: "แก้ไขสำเร็จ" }, 404: { $ref: "#/components/responses/NotFound" } },
    },
    delete: {
      tags: ["Tools"],
      summary: "ลบหมวดหมู่เครื่องมือ",
      description: "**จะ Error ถ้ายังมีเครื่องมืออยู่** **Role ที่ต้องการ: ADMIN**",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "ลบสำเร็จ" }, 400: { description: "ยังมีเครื่องมืออยู่ในหมวดหมู่นี้" } },
    },
  },

  // ── BORROW RECORDS ─────────────────────────────────────────────────────────
  "/tools/borrow-records": {
    get: {
      tags: ["Tools"],
      summary: "List ประวัติการยืมเครื่องมือ",
      description: "ดูประวัติการยืมทั้งหมด กรองได้หลายแบบ ใช้ `active=true` เพื่อดูรายการที่ยังไม่คืน",
      parameters: [
        { $ref: "#/components/parameters/PageParam" },
        { $ref: "#/components/parameters/LimitParam" },
        { name: "toolId", in: "query", schema: { $ref: "#/components/schemas/UUID" }, description: "กรองตามเครื่องมือ" },
        { name: "borrowedBy", in: "query", schema: { $ref: "#/components/schemas/UUID" }, description: "กรองตามผู้ยืม" },
        { name: "active", in: "query", schema: { type: "string", enum: ["true", "false"] }, description: "`true` = แสดงเฉพาะที่ยังไม่คืน (returnedAt IS NULL)" },
      ],
      responses: {
        200: {
          description: "รายการประวัติการยืม",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "array", items: { $ref: "#/components/schemas/ToolBorrowRecord" } },
                  pagination: { $ref: "#/components/schemas/PaginationMeta" },
                },
              },
            },
          },
        },
      },
    },
  },
  "/tools/borrow-records/{id}/return": {
    patch: {
      tags: ["Tools"],
      summary: "คืนเครื่องมือ",
      description: `บันทึกการคืนเครื่องมือ พร้อมระบุสภาพหลังคืน

**Logic อัตโนมัติ:**
- ถ้า \`conditionOnReturn = POOR\` → เปลี่ยน tool status เป็น \`MAINTENANCE\` อัตโนมัติ
- ถ้า condition ปกติ → เปลี่ยน tool status กลับเป็น \`AVAILABLE\`
- บันทึก returnedBy = userId ของผู้คืน`,
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["conditionOnReturn"],
              properties: {
                conditionOnReturn: { $ref: "#/components/schemas/ToolCondition" },
                note: { type: "string", example: "มีรอยขีดข่วนเล็กน้อย ใช้งานได้ปกติ" },
              },
            },
            examples: {
              good: { summary: "คืนสภาพดี", value: { conditionOnReturn: "GOOD" } },
              poor: { summary: "คืนสภาพแย่ (ส่ง MAINTENANCE)", value: { conditionOnReturn: "POOR", note: "เครื่องมือชำรุด ต้องซ่อม" } },
            },
          },
        },
      },
      responses: {
        200: {
          description: "คืนสำเร็จ",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { $ref: "#/components/schemas/ToolBorrowRecord" },
                  message: { type: "string", example: "Tool returned. Status set to MAINTENANCE due to poor condition." },
                },
              },
            },
          },
        },
        400: { description: "เครื่องมือนี้ถูกคืนไปแล้ว" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },

  // ── TOOLS ──────────────────────────────────────────────────────────────────
  "/tools": {
    get: {
      tags: ["Tools"],
      summary: "List เครื่องมือทั้งหมด",
      description: "ดึงรายการเครื่องมือพร้อม category, location และ warehouse",
      parameters: [
        { $ref: "#/components/parameters/PageParam" },
        { $ref: "#/components/parameters/LimitParam" },
        { $ref: "#/components/parameters/SearchParam" },
        { name: "status", in: "query", schema: { $ref: "#/components/schemas/ToolStatus" }, description: "กรองตามสถานะ" },
        { name: "categoryId", in: "query", schema: { $ref: "#/components/schemas/UUID" }, description: "กรองตามหมวดหมู่" },
        { name: "isActive", in: "query", schema: { type: "string", enum: ["true", "false"] } },
      ],
      responses: {
        200: {
          description: "รายการเครื่องมือ",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "array", items: { $ref: "#/components/schemas/Tool" } },
                  pagination: { $ref: "#/components/schemas/PaginationMeta" },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Tools"],
      summary: "เพิ่มเครื่องมือใหม่",
      description: "**Role ที่ต้องการ: ADMIN, MANAGER**",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["code", "name", "categoryId"],
              properties: {
                code: { type: "string", example: "T026" },
                name: { type: "string", example: "ประแจวัดแรงบิด 200Nm" },
                serialNumber: { type: "string", example: "TRQ-2024-026", nullable: true },
                description: { type: "string" },
                categoryId: { $ref: "#/components/schemas/UUID" },
                locationId: { allOf: [{ $ref: "#/components/schemas/UUID" }], nullable: true, description: "ตำแหน่งเริ่มต้นที่เก็บ" },
                status: { $ref: "#/components/schemas/ToolStatus" },
                condition: { $ref: "#/components/schemas/ToolCondition" },
              },
            },
          },
        },
      },
      responses: { 201: { description: "สร้างสำเร็จ" }, 409: { description: "รหัสเครื่องมือซ้ำ" } },
    },
  },
  "/tools/{id}": {
    get: {
      tags: ["Tools"],
      summary: "รายละเอียดเครื่องมือ",
      description: "ดูข้อมูลเครื่องมือ + ประวัติการยืม 10 รายการล่าสุด",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: {
        200: {
          description: "รายละเอียดเครื่องมือ",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    allOf: [
                      { $ref: "#/components/schemas/Tool" },
                      { type: "object", properties: { borrowRecords: { type: "array", items: { $ref: "#/components/schemas/ToolBorrowRecord" }, description: "ประวัติ 10 รายการล่าสุด" } } },
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
      tags: ["Tools"],
      summary: "แก้ไขข้อมูลเครื่องมือ",
      description: "**Role ที่ต้องการ: ADMIN, MANAGER**",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                categoryId: { $ref: "#/components/schemas/UUID" },
                locationId: { $ref: "#/components/schemas/UUID" },
                status: { $ref: "#/components/schemas/ToolStatus" },
                condition: { $ref: "#/components/schemas/ToolCondition" },
              },
            },
          },
        },
      },
      responses: { 200: { description: "แก้ไขสำเร็จ" }, 404: { $ref: "#/components/responses/NotFound" } },
    },
    delete: {
      tags: ["Tools"],
      summary: "ปิดใช้งานเครื่องมือ",
      description: "Soft delete — ตั้ง isActive=false **Role ที่ต้องการ: ADMIN**",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "ปิดใช้งานสำเร็จ" } },
    },
  },
  "/tools/{id}/borrow": {
    post: {
      tags: ["Tools"],
      summary: "ยืมเครื่องมือ",
      description: `บันทึกการยืมเครื่องมือ

**กฎ:** เครื่องมือต้องมี status = \`AVAILABLE\` เท่านั้น

**ผลอัตโนมัติ:** เปลี่ยน tool status เป็น \`BORROWED\``,
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                purpose: { type: "string", example: "งานซ่อมมอเตอร์ปั๊มน้ำ สาย 3" },
                dueAt: { type: "string", format: "date-time", example: "2024-06-10T17:00:00.000Z", description: "กำหนดคืน (optional)" },
                conditionOnBorrow: { $ref: "#/components/schemas/ToolCondition" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "ยืมสำเร็จ",
          content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/ToolBorrowRecord" } } } } },
        },
        400: { description: "เครื่องมือไม่ว่าง (status ไม่ใช่ AVAILABLE)", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" }, example: { success: false, message: "Tool is not available. Current status: BORROWED" } } } },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};

export default toolSpec;
