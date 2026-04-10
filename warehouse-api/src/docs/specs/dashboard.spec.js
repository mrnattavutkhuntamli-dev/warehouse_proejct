const dashboardSpec = {
  "/dashboard/overview": {
    get: {
      tags: ["Dashboard"],
      summary: "ภาพรวมระบบ",
      description: "ตัวเลขสรุปภาพรวมของระบบทั้งหมด เหมาะสำหรับแสดงบน Dashboard หน้าหลัก",
      responses: {
        200: {
          description: "ข้อมูลภาพรวม",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      totalMaterials: { type: "integer", example: 40, description: "จำนวนวัสดุทั้งหมด (active)" },
                      lowStockCount: { type: "integer", example: 5, description: "วัสดุที่ต่ำกว่า minStock" },
                      totalSuppliers: { type: "integer", example: 10, description: "ผู้จำหน่ายที่ active" },
                      totalWarehouses: { type: "integer", example: 3, description: "คลังสินค้าทั้งหมด" },
                      pendingPOs: { type: "integer", example: 3, description: "PO ที่รอดำเนินการ (DRAFT + APPROVED)" },
                      pendingIssues: { type: "integer", example: 7, description: "ใบเบิกที่รอดำเนินการ (DRAFT + APPROVED)" },
                      toolAvailability: {
                        type: "object",
                        properties: {
                          available: { type: "integer", example: 18 },
                          borrowed: { type: "integer", example: 5 },
                          maintenance: { type: "integer", example: 2 },
                          broken: { type: "integer", example: 0 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
  "/dashboard/inventory-value": {
    get: {
      tags: ["Dashboard"],
      summary: "มูลค่าสินค้าคงคลัง",
      description: `คำนวณมูลค่าสต็อกทั้งหมด โดยใช้ \`quantity × lastUnitPrice\` (ราคาล่าสุดจาก GoodsReceipt)

แสดงผลแยกตามวัสดุ เรียงจากมูลค่าสูงสุด

**Role ที่ต้องการ: ADMIN, MANAGER**`,
      responses: {
        200: {
          description: "มูลค่าสินค้าคงคลัง",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      totalValue: { type: "number", format: "decimal", example: 2850000.50, description: "มูลค่ารวมทั้งหมด (บาท)" },
                      breakdown: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            materialId: { $ref: "#/components/schemas/UUID" },
                            materialCode: { type: "string", example: "MTL006" },
                            materialName: { type: "string", example: "แบริ่ง 6205-2RS" },
                            totalQuantity: { type: "number", example: 85 },
                            lastUnitPrice: { type: "number", example: 350 },
                            totalValue: { type: "number", example: 29750 },
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
        403: { $ref: "#/components/responses/Forbidden" },
      },
    },
  },
  "/dashboard/top-issued-materials": {
    get: {
      tags: ["Dashboard"],
      summary: "วัสดุที่ถูกเบิกมากสุด",
      description: "แสดง Top N วัสดุที่ถูกเบิก (ISSUED) มากที่สุด ในช่วงเวลาที่กำหนด",
      parameters: [
        { name: "limit", in: "query", schema: { type: "integer", default: 5, minimum: 1, maximum: 20 }, description: "จำนวน Top N" },
        { name: "days", in: "query", schema: { type: "integer", default: 30, minimum: 1 }, description: "ย้อนหลังกี่วัน" },
      ],
      responses: {
        200: {
          description: "Top วัสดุที่ถูกเบิก",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        materialId: { $ref: "#/components/schemas/UUID" },
                        materialCode: { type: "string", example: "MTL023" },
                        materialName: { type: "string", example: "ถุงมือยาง L" },
                        unit: { type: "string", example: "คู่" },
                        issueCount: { type: "integer", example: 12, description: "จำนวนครั้งที่ถูกเบิก" },
                        totalIssuedQty: { type: "number", example: 240, description: "ปริมาณรวมที่ถูกเบิก" },
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
  },
  "/dashboard/supplier-stats": {
    get: {
      tags: ["Dashboard"],
      summary: "สถิติ Supplier",
      description: `วิเคราะห์ประสิทธิภาพของ supplier แต่ละราย

**Role ที่ต้องการ: ADMIN, MANAGER**`,
      responses: {
        200: {
          description: "สถิติ Supplier",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        supplierId: { $ref: "#/components/schemas/UUID" },
                        supplierCode: { type: "string", example: "SUP001" },
                        supplierName: { type: "string", example: "บริษัท ออยล์เทค จำกัด" },
                        totalPOs: { type: "integer", example: 8, description: "PO ทั้งหมด" },
                        receivedPOs: { type: "integer", example: 6, description: "PO ที่รับครบแล้ว" },
                        cancelledPOs: { type: "integer", example: 1, description: "PO ที่ยกเลิก" },
                        totalPurchaseValue: { type: "number", example: 450000, description: "มูลค่ารวม (บาท)" },
                        fulfillmentRate: { type: "number", example: 75.0, description: "อัตราส่งของสำเร็จ (%)" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        403: { $ref: "#/components/responses/Forbidden" },
      },
    },
  },
  "/dashboard/stock-movement": {
    get: {
      tags: ["Dashboard"],
      summary: "Trend การเคลื่อนไหวสต็อก",
      description: "แสดงกราฟ trend การเคลื่อนไหวสต็อกรายวัน แยกตามประเภท IN/OUT/ADJUST/RETURN/TRANSFER",
      parameters: [
        { name: "days", in: "query", schema: { type: "integer", default: 30, minimum: 7, maximum: 365 }, description: "ย้อนหลังกี่วัน (7–365)" },
      ],
      responses: {
        200: {
          description: "Trend การเคลื่อนไหวสต็อก",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        date: { type: "string", format: "date", example: "2024-06-01" },
                        type: { $ref: "#/components/schemas/TransactionType" },
                        count: { type: "integer", example: 5, description: "จำนวนครั้ง" },
                        totalQuantity: { type: "number", example: 350.5, description: "ปริมาณรวม" },
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
  },
  "/dashboard/tool-utilization": {
    get: {
      tags: ["Dashboard"],
      summary: "อัตราการใช้งานเครื่องมือ",
      description: "วิเคราะห์การใช้งานเครื่องมือแยกตามหมวดหมู่ พร้อม utilizationRate และสถานะทุกประเภท",
      responses: {
        200: {
          description: "สถิติการใช้งานเครื่องมือ",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        categoryId: { $ref: "#/components/schemas/UUID" },
                        categoryName: { type: "string", example: "เครื่องมือไฟฟ้า" },
                        total: { type: "integer", example: 8 },
                        available: { type: "integer", example: 5 },
                        borrowed: { type: "integer", example: 2 },
                        maintenance: { type: "integer", example: 1 },
                        broken: { type: "integer", example: 0 },
                        utilizationRate: { type: "number", example: 25.0, description: "% ของเครื่องมือที่ถูกใช้งาน (borrowed/total)" },
                        poorConditionCount: { type: "integer", example: 1, description: "เครื่องมือสภาพแย่ที่ต้องดูแล" },
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
  },
};

export default dashboardSpec;
