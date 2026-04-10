const warehouseSpec = {
  "/warehouses/locations": {
    get: {
      tags: ["Warehouses"],
      summary: "List ตำแหน่งจัดเก็บทั้งหมด",
      description: "ดึง locations ทุกตำแหน่ง กรองตาม warehouse ได้",
      parameters: [
        { name: "warehouseId", in: "query", schema: { $ref: "#/components/schemas/UUID" }, description: "กรองตาม warehouse" },
      ],
      responses: {
        200: { description: "รายการ locations", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/WarehouseLocation" } } } } } } },
      },
    },
    post: {
      tags: ["Warehouses"],
      summary: "สร้าง location ใหม่",
      description: "เพิ่มตำแหน่งจัดเก็บในคลัง **Role ที่ต้องการ: ADMIN, MANAGER**",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["code", "warehouseId"],
              properties: {
                code: { type: "string", example: "C-01-01" },
                description: { type: "string", example: "ชั้น C แถว 1 ช่อง 1" },
                warehouseId: { $ref: "#/components/schemas/UUID" },
              },
            },
          },
        },
      },
      responses: { 201: { description: "สร้างสำเร็จ" }, 404: { description: "ไม่พบ warehouse" }, 409: { description: "รหัส location ซ้ำ" } },
    },
  },
  "/warehouses/locations/{id}": {
    get: {
      tags: ["Warehouses"],
      summary: "รายละเอียด location",
      description: "ดูข้อมูล location พร้อมรายการสต็อกทั้งหมดที่จัดเก็บอยู่",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: {
        200: {
          description: "ข้อมูล location + stocks",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    allOf: [
                      { $ref: "#/components/schemas/WarehouseLocation" },
                      { type: "object", properties: { stocks: { type: "array", items: { $ref: "#/components/schemas/Stock" } } } },
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
      tags: ["Warehouses"],
      summary: "แก้ไข location",
      description: "**Role ที่ต้องการ: ADMIN, MANAGER**",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { type: "object", properties: { description: { type: "string" }, isActive: { type: "boolean" } } } } },
      },
      responses: { 200: { description: "แก้ไขสำเร็จ" }, 404: { $ref: "#/components/responses/NotFound" } },
    },
    delete: {
      tags: ["Warehouses"],
      summary: "ปิดใช้งาน location",
      description: "Soft delete **Role ที่ต้องการ: ADMIN**",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "ปิดใช้งานสำเร็จ" } },
    },
  },
  "/warehouses": {
    get: {
      tags: ["Warehouses"],
      summary: "List คลังสินค้าทั้งหมด",
      description: "ดึงรายการคลังทั้งหมดพร้อมจำนวน location",
      responses: {
        200: { description: "รายการคลัง", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { allOf: [{ $ref: "#/components/schemas/Warehouse" }, { type: "object", properties: { _count: { type: "object", properties: { locations: { type: "integer" } } } } }] } } } } } } },
      },
    },
    post: {
      tags: ["Warehouses"],
      summary: "สร้างคลังใหม่",
      description: "**Role ที่ต้องการ: ADMIN, MANAGER**",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["code", "name"],
              properties: {
                code: { type: "string", example: "WH04" },
                name: { type: "string", example: "คลังสำรอง B" },
                type: { $ref: "#/components/schemas/WarehouseType" },
              },
            },
          },
        },
      },
      responses: { 201: { description: "สร้างสำเร็จ" }, 409: { description: "รหัสคลังซ้ำ" } },
    },
  },
  "/warehouses/{id}": {
    get: {
      tags: ["Warehouses"],
      summary: "รายละเอียดคลัง",
      description: "ดูข้อมูลคลังพร้อม locations ทั้งหมดที่ active",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: {
        200: {
          description: "ข้อมูลคลัง + locations",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    allOf: [
                      { $ref: "#/components/schemas/Warehouse" },
                      { type: "object", properties: { locations: { type: "array", items: { $ref: "#/components/schemas/WarehouseLocation" } } } },
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
      tags: ["Warehouses"],
      summary: "แก้ไขคลัง",
      description: "**Role ที่ต้องการ: ADMIN, MANAGER**",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, type: { $ref: "#/components/schemas/WarehouseType" }, isActive: { type: "boolean" } } } } } },
      responses: { 200: { description: "แก้ไขสำเร็จ" } },
    },
    delete: {
      tags: ["Warehouses"],
      summary: "ปิดใช้งานคลัง",
      description: "Soft delete **Role ที่ต้องการ: ADMIN**",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "ปิดใช้งานสำเร็จ" } },
    },
  },
};

export default warehouseSpec;
