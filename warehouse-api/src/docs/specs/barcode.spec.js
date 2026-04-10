const barcodeSpec = {
  "/barcode/scan": {
    post: {
      tags: ["Barcode"],
      summary: "สแกน QR / Barcode",
      description: `ใช้สำหรับ Mobile App — ส่ง barcodeData ที่สแกนได้มา แล้วจะ resolve เป็นข้อมูล entity พร้อมรายละเอียด

**รูปแบบ barcodeData ที่รองรับ:**

| Format | ตัวอย่าง | ผลลัพธ์ |
|--------|----------|---------|
| \`MAT:<code>\` | \`MAT:MTL001\` | Material + สต็อกทุก location |
| \`LOC:<code>\` | \`LOC:A-01-01\` | Location + รายการสต็อกทั้งหมด |
| \`TOOL:<code>\` | \`TOOL:T001\` | Tool + สถานะ + ผู้ยืมปัจจุบัน |`,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["barcodeData"],
              properties: {
                barcodeData: {
                  type: "string",
                  example: "MAT:MTL001",
                  description: "ข้อมูลที่สแกนได้ ในรูปแบบ PREFIX:CODE",
                },
              },
            },
            examples: {
              material: { summary: "สแกนวัสดุ", value: { barcodeData: "MAT:MTL001" } },
              location: { summary: "สแกน Location", value: { barcodeData: "LOC:A-01-01" } },
              tool: { summary: "สแกนเครื่องมือ", value: { barcodeData: "TOOL:T001" } },
            },
          },
        },
      },
      responses: {
        200: {
          description: "ข้อมูล entity ที่ resolve ได้",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["material", "location", "tool"], example: "material" },
                      entity: {
                        description: "ข้อมูล entity ตามประเภท",
                        oneOf: [
                          { $ref: "#/components/schemas/Material" },
                          { $ref: "#/components/schemas/WarehouseLocation" },
                          { $ref: "#/components/schemas/Tool" },
                        ],
                      },
                    },
                  },
                },
              },
              examples: {
                material: {
                  summary: "ผลลัพธ์วัสดุ",
                  value: {
                    success: true,
                    data: {
                      type: "material",
                      entity: {
                        id: "uuid",
                        code: "MTL001",
                        name: "น้ำมันเกียร์ ISO 68",
                        unit: "ลิตร",
                        stocks: [{ locationId: "uuid", quantity: 150.5, location: { code: "A-01-01" } }],
                      },
                    },
                  },
                },
                tool: {
                  summary: "ผลลัพธ์เครื่องมือ",
                  value: {
                    success: true,
                    data: {
                      type: "tool",
                      entity: {
                        id: "uuid",
                        code: "T001",
                        name: "สว่านไฟฟ้า Bosch 13mm",
                        status: "BORROWED",
                        currentBorrower: { name: "ประเสริฐ ทำงานดี", borrowedAt: "2024-06-01T08:00:00Z" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: "รูปแบบ barcodeData ไม่ถูกต้อง", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" }, example: { success: false, message: "Invalid barcode format. Expected PREFIX:CODE (e.g. MAT:MTL001)" } } } },
        404: { description: "ไม่พบ entity ที่ตรงกับ code นี้" },
      },
    },
  },
  "/barcode/bulk": {
    post: {
      tags: ["Barcode"],
      summary: "Bulk generate barcode payloads",
      description: `สร้าง barcode payload หลายรายการพร้อมกัน สำหรับพิมพ์ label sticker

ถ้าไม่ระบุ \`ids\` จะ generate สำหรับทุก entity ของ type นั้น`,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["type"],
              properties: {
                type: { type: "string", enum: ["material", "location", "tool"], example: "material" },
                ids: {
                  type: "array",
                  items: { $ref: "#/components/schemas/UUID" },
                  description: "UUID ที่ต้องการ (ถ้าไม่ระบุ = ทั้งหมด)",
                  example: ["uuid-1", "uuid-2", "uuid-3"],
                },
              },
            },
            examples: {
              specificMaterials: { summary: "วัสดุบางตัว", value: { type: "material", ids: ["uuid-1", "uuid-2"] } },
              allLocations: { summary: "ทุก location", value: { type: "location" } },
            },
          },
        },
      },
      responses: {
        200: {
          description: "รายการ barcode payloads",
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
                        id: { $ref: "#/components/schemas/UUID" },
                        code: { type: "string", example: "MTL001" },
                        name: { type: "string", example: "น้ำมันเกียร์ ISO 68" },
                        barcodePayload: { type: "string", example: "MAT:MTL001", description: "string สำหรับ encode เป็น QR/Barcode" },
                      },
                    },
                  },
                  total: { type: "integer", example: 40 },
                },
              },
            },
          },
        },
      },
    },
  },
  "/barcode/material/{id}": {
    get: {
      tags: ["Barcode"],
      summary: "Barcode payload ของวัสดุ",
      description: "ดึง barcode payload สำหรับพิมพ์ label วัสดุ พร้อมข้อมูล QR code instructions",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: {
        200: {
          description: "Barcode data ของวัสดุ",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      barcodePayload: { type: "string", example: "MAT:MTL001" },
                      displayName: { type: "string", example: "MTL001 — น้ำมันเกียร์ ISO 68" },
                      material: { $ref: "#/components/schemas/Material" },
                    },
                  },
                },
              },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/barcode/location/{id}": {
    get: {
      tags: ["Barcode"],
      summary: "Barcode payload ของ Location",
      description: "ดึง barcode payload สำหรับพิมพ์ label ตำแหน่งจัดเก็บ พร้อมข้อมูล warehouse",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: {
        200: {
          description: "Barcode data ของ location",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      barcodePayload: { type: "string", example: "LOC:A-01-01" },
                      displayName: { type: "string", example: "A-01-01 — ชั้น A แถว 1 ช่อง 1" },
                      location: { $ref: "#/components/schemas/WarehouseLocation" },
                    },
                  },
                },
              },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/barcode/tool/{id}": {
    get: {
      tags: ["Barcode"],
      summary: "Barcode payload ของเครื่องมือ",
      description: "ดึง barcode payload สำหรับพิมพ์ label เครื่องมือ พร้อมสถานะและผู้ยืมปัจจุบัน (ถ้ามี)",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: {
        200: {
          description: "Barcode data ของเครื่องมือ",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      barcodePayload: { type: "string", example: "TOOL:T001" },
                      displayName: { type: "string", example: "T001 — สว่านไฟฟ้า Bosch 13mm" },
                      tool: { $ref: "#/components/schemas/Tool" },
                      currentBorrower: {
                        nullable: true,
                        type: "object",
                        properties: {
                          name: { type: "string", example: "ประเสริฐ ทำงานดี" },
                          borrowedAt: { type: "string", format: "date-time" },
                          dueAt: { type: "string", format: "date-time", nullable: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};

export default barcodeSpec;
