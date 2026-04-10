const materialSpec = {
  "/materials/categories": {
    get: {
      tags: ["Materials"],
      summary: "List หมวดหมู่วัสดุ",
      description: "ดึงหมวดหมู่ทั้งหมดพร้อมจำนวนวัสดุในแต่ละหมวด",
      responses: {
        200: { description: "รายการหมวดหมู่", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/MaterialCategory" } } } } } } },
      },
    },
    post: {
      tags: ["Materials"],
      summary: "สร้างหมวดหมู่",
      description: "**Role ที่ต้องการ: ADMIN, MANAGER**",
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name"], properties: { name: { type: "string", example: "น้ำมันหล่อลื่น" } } } } } },
      responses: { 201: { description: "สร้างสำเร็จ" }, 409: { description: "ชื่อหมวดหมู่ซ้ำ" } },
    },
  },
  "/materials/categories/{id}": {
    put: {
      tags: ["Materials"],
      summary: "แก้ไขหมวดหมู่",
      description: "**Role ที่ต้องการ: ADMIN, MANAGER**",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name"], properties: { name: { type: "string", example: "น้ำมันหล่อลื่นและสารหล่อเย็น" } } } } } },
      responses: { 200: { description: "แก้ไขสำเร็จ" }, 404: { $ref: "#/components/responses/NotFound" } },
    },
    delete: {
      tags: ["Materials"],
      summary: "ลบหมวดหมู่",
      description: "**จะ Error ถ้ายังมีวัสดุอยู่** **Role ที่ต้องการ: ADMIN**",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "ลบสำเร็จ" }, 400: { description: "ไม่สามารถลบได้ มีวัสดุอยู่ในหมวดนี้" } },
    },
  },
  "/materials/low-stock": {
    get: {
      tags: ["Materials"],
      summary: "⚠️ วัสดุที่สต็อกต่ำกว่าเกณฑ์",
      description: "ดึงรายการวัสดุที่ยอดสต็อกรวมทุก location ต่ำกว่าค่า `minStock` ที่ตั้งไว้ ใช้สำหรับแจ้งเตือนเพื่อสั่งซื้อเพิ่ม",
      responses: {
        200: {
          description: "รายการวัสดุที่ต้องสั่งซื้อเพิ่ม",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: {
                      allOf: [
                        { $ref: "#/components/schemas/Material" },
                        { type: "object", properties: { totalStock: { type: "number", example: 12, description: "stock รวมทุก location" } } },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/materials": {
    get: {
      tags: ["Materials"],
      summary: "List วัสดุทั้งหมด",
      description: "ดึงรายการวัสดุพร้อม stock ทุก location pagination และ filter",
      parameters: [
        { $ref: "#/components/parameters/PageParam" },
        { $ref: "#/components/parameters/LimitParam" },
        { $ref: "#/components/parameters/SearchParam" },
        { name: "categoryId", in: "query", schema: { $ref: "#/components/schemas/UUID" }, description: "กรองตามหมวดหมู่" },
        { name: "isActive", in: "query", schema: { type: "string", enum: ["true", "false"] } },
      ],
      responses: {
        200: {
          description: "รายการวัสดุ",
          content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Material" } }, pagination: { $ref: "#/components/schemas/PaginationMeta" } } } } },
        },
      },
    },
    post: {
      tags: ["Materials"],
      summary: "สร้างวัสดุใหม่",
      description: "**Role ที่ต้องการ: ADMIN, MANAGER**",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["code", "name", "unit", "categoryId"],
              properties: {
                code: { type: "string", example: "MTL041" },
                name: { type: "string", example: "น้ำมันเกียร์ ISO 100" },
                description: { type: "string" },
                unit: { type: "string", example: "ลิตร" },
                minStock: { type: "number", example: 50 },
                categoryId: { $ref: "#/components/schemas/UUID" },
              },
            },
          },
        },
      },
      responses: { 201: { description: "สร้างสำเร็จ" }, 409: { description: "รหัสวัสดุซ้ำ" } },
    },
  },
  "/materials/{id}": {
    get: {
      tags: ["Materials"],
      summary: "รายละเอียดวัสดุ",
      description: "ดูข้อมูลวัสดุพร้อมยอด stock ทุก location พร้อม warehouse info",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "ข้อมูลวัสดุ", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Material" } } } } } }, 404: { $ref: "#/components/responses/NotFound" } },
    },
    put: {
      tags: ["Materials"],
      summary: "แก้ไขวัสดุ",
      description: "**Role ที่ต้องการ: ADMIN, MANAGER**",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" }, description: { type: "string" },
                unit: { type: "string" }, minStock: { type: "number" }, categoryId: { $ref: "#/components/schemas/UUID" },
              },
            },
          },
        },
      },
      responses: { 200: { description: "แก้ไขสำเร็จ" }, 404: { $ref: "#/components/responses/NotFound" } },
    },
    delete: {
      tags: ["Materials"],
      summary: "ปิดใช้งานวัสดุ",
      description: "Soft delete — ตั้ง isActive=false **Role ที่ต้องการ: ADMIN**",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "ปิดใช้งานสำเร็จ" }, 404: { $ref: "#/components/responses/NotFound" } },
    },
  },
};

export default materialSpec;
