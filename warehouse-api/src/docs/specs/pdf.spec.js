const pdfBinaryResponse = {
  description: "ไฟล์ PDF (binary)",
  headers: {
    "Content-Type": { schema: { type: "string", example: "application/pdf" } },
    "Content-Disposition": { schema: { type: "string", example: "attachment; filename=PO-20240601-4521.pdf" } },
  },
  content: {
    "application/pdf": {
      schema: { type: "string", format: "binary" },
    },
  },
};

const pdfSpec = {
  "/pdf/purchase-orders/{id}": {
    get: {
      tags: ["PDF"],
      summary: "Export ใบสั่งซื้อ (PO) เป็น PDF",
      description: `Download ไฟล์ PDF ของ Purchase Order

**เนื้อหาในเอกสาร:**
- Header บริษัท (ชื่อ, ที่อยู่, เบอร์โทร — กำหนดใน .env)
- ข้อมูล PO: เลขที่, วันที่, ผู้สร้าง, ผู้อนุมัติ
- ข้อมูล Supplier: ชื่อ, ที่อยู่, เบอร์โทร, email
- ตาราง Items: รหัสวัสดุ, ชื่อ, จำนวน, ราคาต่อหน่วย, รวม
- Grand Total และ VAT (7%)
- ช่อง Signature: ผู้จัดทำ / ผู้อนุมัติ / ผู้รับสินค้า

**Environment Variables ที่เกี่ยวข้อง:**
\`\`\`
COMPANY_NAME="บริษัท ตัวอย่าง จำกัด"
COMPANY_ADDRESS="123 ถนนตัวอย่าง กรุงเทพฯ 10100"
COMPANY_PHONE="02-000-0000"
\`\`\``,
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { $ref: "#/components/schemas/UUID" },
          description: "UUID ของ Purchase Order",
        },
      ],
      responses: {
        200: pdfBinaryResponse,
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/pdf/material-issues/{id}": {
    get: {
      tags: ["PDF"],
      summary: "Export ใบเบิกวัสดุ เป็น PDF",
      description: `Download ไฟล์ PDF ของ Material Issue

**เนื้อหาในเอกสาร:**
- Header บริษัท
- ข้อมูลใบเบิก: เลขที่, วันที่, วัตถุประสงค์
- ข้อมูลผู้เบิก: ชื่อ, รหัสพนักงาน, แผนก
- ตาราง Items: รหัสวัสดุ, ชื่อ, หน่วย, จำนวน, ตำแหน่งที่เบิก (location + warehouse)
- ช่อง Signature: ผู้เบิก / ผู้อนุมัติ / ผู้จ่ายวัสดุ`,
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { $ref: "#/components/schemas/UUID" },
          description: "UUID ของ Material Issue",
        },
      ],
      responses: {
        200: pdfBinaryResponse,
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/pdf/goods-receipts/{id}": {
    get: {
      tags: ["PDF"],
      summary: "Export ใบรับสินค้า (GR) เป็น PDF",
      description: `Download ไฟล์ PDF ของ Goods Receipt

**เนื้อหาในเอกสาร:**
- Header บริษัท
- ข้อมูล GR: เลขที่รับ, วันที่รับ, ผู้รับ
- อ้างอิง PO (ถ้ามี)
- ข้อมูล Supplier
- ตาราง Items: รหัสวัสดุ, ชื่อ, หน่วย, จำนวนที่รับ, ราคาต่อหน่วย, รวม, ตำแหน่งที่เก็บ
- Grand Total
- ช่อง Signature: ผู้รับสินค้า / เจ้าหน้าที่คลัง`,
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { $ref: "#/components/schemas/UUID" },
          description: "UUID ของ Goods Receipt",
        },
      ],
      responses: {
        200: pdfBinaryResponse,
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};

export default pdfSpec;
