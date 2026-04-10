const supplierSpec = {
  "/suppliers": {
    get: {
      tags: ["Suppliers"],
      summary: "List ผู้จำหน่ายทั้งหมด",
      parameters: [
        { $ref: "#/components/parameters/PageParam" },
        { $ref: "#/components/parameters/LimitParam" },
        { $ref: "#/components/parameters/SearchParam" },
        { name: "isActive", in: "query", schema: { type: "string", enum: ["true", "false"] } },
      ],
      responses: {
        200: { description: "รายการผู้จำหน่าย", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Supplier" } }, pagination: { $ref: "#/components/schemas/PaginationMeta" } } } } } },
      },
    },
    post: {
      tags: ["Suppliers"],
      summary: "สร้างผู้จำหน่ายใหม่",
      description: "**Role ที่ต้องการ: ADMIN, MANAGER**",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["code", "name"],
              properties: {
                code: { type: "string", example: "SUP011" },
                name: { type: "string", example: "บริษัท ใหม่ จำกัด" },
                contact: { type: "string", example: "คุณใหม่" },
                phone: { type: "string", example: "02-111-2222" },
                email: { type: "string", format: "email", example: "info@new.co.th" },
                address: { type: "string", example: "123 ถนนอุตสาหกรรม" },
              },
            },
          },
        },
      },
      responses: { 201: { description: "สร้างสำเร็จ" }, 409: { description: "รหัสผู้จำหน่ายซ้ำ" } },
    },
  },
  "/suppliers/{id}": {
    get: {
      tags: ["Suppliers"],
      summary: "รายละเอียดผู้จำหน่าย",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "ข้อมูลผู้จำหน่าย" }, 404: { $ref: "#/components/responses/NotFound" } },
    },
    put: {
      tags: ["Suppliers"],
      summary: "แก้ไขผู้จำหน่าย",
      description: "**Role ที่ต้องการ: ADMIN, MANAGER**",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, contact: { type: "string" }, phone: { type: "string" }, email: { type: "string", format: "email" }, address: { type: "string" }, isActive: { type: "boolean" } } } } },
      },
      responses: { 200: { description: "แก้ไขสำเร็จ" }, 404: { $ref: "#/components/responses/NotFound" } },
    },
    delete: {
      tags: ["Suppliers"],
      summary: "ปิดใช้งานผู้จำหน่าย",
      description: "Soft delete **Role ที่ต้องการ: ADMIN**",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "ปิดใช้งานสำเร็จ" }, 404: { $ref: "#/components/responses/NotFound" } },
    },
  },
};

export default supplierSpec;
