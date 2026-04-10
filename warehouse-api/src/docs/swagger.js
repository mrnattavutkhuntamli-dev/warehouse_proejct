import authSpec from "./specs/auth.spec.js";
import userSpec from "./specs/user.spec.js";
import materialSpec from "./specs/material.spec.js";
import supplierSpec from "./specs/supplier.spec.js";
import warehouseSpec from "./specs/warehouse.spec.js";
import stockSpec from "./specs/stock.spec.js";
import procurementSpec from "./specs/procurement.spec.js";
import toolSpec from "./specs/tool.spec.js";
import dashboardSpec from "./specs/dashboard.spec.js";
import barcodeSpec from "./specs/barcode.spec.js";
import pdfSpec from "./specs/pdf.spec.js";
import auditSpec from "./specs/audit.spec.js";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "🏭 Warehouse Management System API",
    version: "3.0.0",
    description: `
## ระบบจัดการคลังสินค้าและเครื่องมือ

API สำหรับระบบจัดการคลังสินค้าครบวงจร ประกอบด้วย:
- 👤 จัดการผู้ใช้งานและแผนก
- 🔩 จัดการวัสดุและหมวดหมู่
- 🏭 จัดการผู้จำหน่าย
- 🏗️ จัดการคลังและตำแหน่งจัดเก็บ
- 📦 จัดการสต็อก Transaction และนับสต็อก
- 🛒 จัดซื้อ รับสินค้า เบิกวัสดุ
- 🔧 จัดการเครื่องมือ ยืม-คืน
- 📊 Dashboard & Analytics
- 📱 Barcode / QR Code
- 📄 PDF Export
- 📝 Audit Log

### Authentication
ทุก endpoint (ยกเว้น \`/auth/login\`) ต้องใส่ JWT token ใน header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

### Role Hierarchy
| Role | สิทธิ์ |
|------|--------|
| \`ADMIN\` | เข้าถึงได้ทุก endpoint รวมถึงลบข้อมูล |
| \`MANAGER\` | สร้าง/แก้ไข Master data, อนุมัติเอกสาร |
| \`STAFF\` | สร้างเอกสาร, ดูข้อมูล |
| \`TECHNICIAN\` | ดูข้อมูล, ยืม-คืนเครื่องมือ |

### Standard Response Format
\`\`\`json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
\`\`\`

### Paginated Response
\`\`\`json
{
  "success": true,
  "message": "...",
  "data": [],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
\`\`\`
    `,
    contact: {
      name: "Warehouse API Support",
      email: "dev@example.com",
    },
    license: { name: "MIT" },
  },
  servers: [
    {
      url: "http://localhost:3000/api/v1",
      description: "Development Server",
    },
    {
      url: "https://api.warehouse.example.com/api/v1",
      description: "Production Server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "ใส่ JWT token ที่ได้จาก /auth/login",
      },
    },
    schemas: {
      // ── COMMON ──────────────────────────────────────────────────────────────
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation successful" },
          data: { type: "object" },
        },
      },
      PaginationMeta: {
        type: "object",
        properties: {
          total: { type: "integer", example: 100 },
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 20 },
          totalPages: { type: "integer", example: 5 },
          hasNext: { type: "boolean", example: true },
          hasPrev: { type: "boolean", example: false },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Error message" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string", example: "email" },
                message: { type: "string", example: "Invalid email format" },
              },
            },
          },
        },
      },
      UUID: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
      // ── ENUMS ────────────────────────────────────────────────────────────────
      Role: { type: "string", enum: ["ADMIN", "MANAGER", "STAFF", "TECHNICIAN"] },
      SkillLevel: { type: "string", enum: ["JUNIOR", "MID", "SENIOR", "EXPERT"] },
      Shift: { type: "string", enum: ["MORNING", "AFTERNOON", "NIGHT"] },
      WarehouseType: { type: "string", enum: ["MAIN", "SUB", "OUTDOOR"] },
      TransactionType: { type: "string", enum: ["IN", "OUT", "TRANSFER", "ADJUST", "RETURN"] },
      ToolStatus: { type: "string", enum: ["AVAILABLE", "BORROWED", "MAINTENANCE", "BROKEN"] },
      ToolCondition: { type: "string", enum: ["GOOD", "FAIR", "POOR"] },
      PurchaseOrderStatus: { type: "string", enum: ["DRAFT", "APPROVED", "PARTIAL_RECEIVED", "RECEIVED", "CANCELLED"] },
      MaterialIssueStatus: { type: "string", enum: ["DRAFT", "APPROVED", "ISSUED", "CANCELLED"] },
      StockCountStatus: { type: "string", enum: ["DRAFT", "COUNTING", "COMPLETED"] },
      AuditAction: { type: "string", enum: ["CREATE", "UPDATE", "DELETE", "APPROVE", "CANCEL", "ISSUE", "BORROW", "RETURN", "ADJUST"] },
      // ── MODELS ───────────────────────────────────────────────────────────────
      Department: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/UUID" },
          name: { type: "string", example: "ฝ่ายซ่อมบำรุง" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Technician: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/UUID" },
          skillLevel: { $ref: "#/components/schemas/SkillLevel" },
          shift: { $ref: "#/components/schemas/Shift" },
          specialty: { type: "string", example: "ไฟฟ้า", nullable: true },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/UUID" },
          employeeCode: { type: "string", example: "EMP001" },
          name: { type: "string", example: "สมชาย วงศ์ใหญ่" },
          email: { type: "string", format: "email", example: "somchai@example.com" },
          phone: { type: "string", example: "0812345678", nullable: true },
          role: { $ref: "#/components/schemas/Role" },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          department: { $ref: "#/components/schemas/Department", nullable: true },
          technician: { $ref: "#/components/schemas/Technician", nullable: true },
        },
      },
      MaterialCategory: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/UUID" },
          name: { type: "string", example: "น้ำมันหล่อลื่น" },
          _count: { type: "object", properties: { materials: { type: "integer", example: 5 } } },
        },
      },
      Material: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/UUID" },
          code: { type: "string", example: "MTL001" },
          name: { type: "string", example: "น้ำมันเกียร์ ISO 68" },
          description: { type: "string", nullable: true },
          unit: { type: "string", example: "ลิตร" },
          minStock: { type: "number", format: "decimal", example: 50, nullable: true },
          isActive: { type: "boolean", example: true },
          category: { $ref: "#/components/schemas/MaterialCategory" },
          stocks: { type: "array", items: { $ref: "#/components/schemas/Stock" } },
        },
      },
      Supplier: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/UUID" },
          code: { type: "string", example: "SUP001" },
          name: { type: "string", example: "บริษัท ออยล์เทค จำกัด" },
          contact: { type: "string", nullable: true },
          phone: { type: "string", nullable: true },
          email: { type: "string", format: "email", nullable: true },
          address: { type: "string", nullable: true },
          isActive: { type: "boolean", example: true },
        },
      },
      Warehouse: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/UUID" },
          code: { type: "string", example: "WH01" },
          name: { type: "string", example: "คลังหลัก อาคาร A" },
          type: { $ref: "#/components/schemas/WarehouseType" },
          isActive: { type: "boolean" },
        },
      },
      WarehouseLocation: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/UUID" },
          code: { type: "string", example: "A-01-01" },
          description: { type: "string", nullable: true },
          warehouseId: { $ref: "#/components/schemas/UUID" },
          isActive: { type: "boolean" },
          warehouse: { $ref: "#/components/schemas/Warehouse" },
        },
      },
      Stock: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/UUID" },
          materialId: { $ref: "#/components/schemas/UUID" },
          locationId: { $ref: "#/components/schemas/UUID" },
          quantity: { type: "number", format: "decimal", example: 150.5 },
          updatedAt: { type: "string", format: "date-time" },
          location: { $ref: "#/components/schemas/WarehouseLocation" },
        },
      },
      StockTransaction: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/UUID" },
          materialId: { $ref: "#/components/schemas/UUID" },
          locationId: { $ref: "#/components/schemas/UUID", nullable: true },
          type: { $ref: "#/components/schemas/TransactionType" },
          quantity: { type: "number", format: "decimal", example: 20 },
          referenceId: { type: "string", nullable: true },
          note: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          creator: { type: "object", properties: { id: { $ref: "#/components/schemas/UUID" }, name: { type: "string" } } },
        },
      },
      PurchaseOrderItem: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/UUID" },
          materialId: { $ref: "#/components/schemas/UUID" },
          quantity: { type: "number", format: "decimal", example: 50 },
          unitPrice: { type: "number", format: "decimal", example: 250 },
          receivedQty: { type: "number", format: "decimal", example: 30 },
          material: { type: "object", properties: { code: { type: "string" }, name: { type: "string" }, unit: { type: "string" } } },
        },
      },
      PurchaseOrder: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/UUID" },
          poNumber: { type: "string", example: "PO-20240601-4521" },
          supplierId: { $ref: "#/components/schemas/UUID" },
          status: { $ref: "#/components/schemas/PurchaseOrderStatus" },
          note: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          approvedAt: { type: "string", format: "date-time", nullable: true },
          supplier: { $ref: "#/components/schemas/Supplier" },
          creator: { type: "object", properties: { id: { $ref: "#/components/schemas/UUID" }, name: { type: "string" } } },
          items: { type: "array", items: { $ref: "#/components/schemas/PurchaseOrderItem" } },
        },
      },
      GoodsReceiptItem: {
        type: "object",
        properties: {
          materialId: { $ref: "#/components/schemas/UUID" },
          locationId: { $ref: "#/components/schemas/UUID" },
          quantity: { type: "number", format: "decimal", example: 20 },
          unitPrice: { type: "number", format: "decimal", example: 250 },
        },
      },
      GoodsReceipt: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/UUID" },
          receiptNo: { type: "string", example: "GR-20240601-1234" },
          supplierId: { $ref: "#/components/schemas/UUID" },
          poId: { $ref: "#/components/schemas/UUID", nullable: true },
          receivedAt: { type: "string", format: "date-time" },
          supplier: { $ref: "#/components/schemas/Supplier" },
          items: { type: "array", items: { $ref: "#/components/schemas/GoodsReceiptItem" } },
        },
      },
      MaterialIssueItem: {
        type: "object",
        properties: {
          materialId: { $ref: "#/components/schemas/UUID" },
          locationId: { $ref: "#/components/schemas/UUID" },
          quantity: { type: "number", format: "decimal", example: 5 },
          material: { type: "object", properties: { code: { type: "string" }, name: { type: "string" }, unit: { type: "string" } } },
        },
      },
      MaterialIssue: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/UUID" },
          issueNo: { type: "string", example: "MI-20240601-7890" },
          purpose: { type: "string", nullable: true },
          status: { $ref: "#/components/schemas/MaterialIssueStatus" },
          createdAt: { type: "string", format: "date-time" },
          requester: { type: "object", properties: { id: { $ref: "#/components/schemas/UUID" }, name: { type: "string" } } },
          approver: { type: "object", nullable: true, properties: { id: { $ref: "#/components/schemas/UUID" }, name: { type: "string" } } },
          items: { type: "array", items: { $ref: "#/components/schemas/MaterialIssueItem" } },
        },
      },
      StockCount: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/UUID" },
          countNo: { type: "string", example: "SC-20240601-3311" },
          warehouseId: { $ref: "#/components/schemas/UUID" },
          status: { $ref: "#/components/schemas/StockCountStatus" },
          createdAt: { type: "string", format: "date-time" },
          completedAt: { type: "string", format: "date-time", nullable: true },
          warehouse: { $ref: "#/components/schemas/Warehouse" },
          counter: { type: "object", properties: { id: { $ref: "#/components/schemas/UUID" }, name: { type: "string" } } },
        },
      },
      ToolCategory: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/UUID" },
          name: { type: "string", example: "เครื่องมือไฟฟ้า" },
          _count: { type: "object", properties: { tools: { type: "integer", example: 8 } } },
        },
      },
      Tool: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/UUID" },
          code: { type: "string", example: "T001" },
          name: { type: "string", example: "สว่านไฟฟ้า Bosch 13mm" },
          serialNumber: { type: "string", nullable: true, example: "BSH-2023-001" },
          status: { $ref: "#/components/schemas/ToolStatus" },
          condition: { $ref: "#/components/schemas/ToolCondition" },
          isActive: { type: "boolean" },
          category: { $ref: "#/components/schemas/ToolCategory" },
          location: { $ref: "#/components/schemas/WarehouseLocation", nullable: true },
        },
      },
      ToolBorrowRecord: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/UUID" },
          toolId: { $ref: "#/components/schemas/UUID" },
          borrowedAt: { type: "string", format: "date-time" },
          dueAt: { type: "string", format: "date-time", nullable: true },
          returnedAt: { type: "string", format: "date-time", nullable: true },
          purpose: { type: "string", nullable: true },
          conditionOnBorrow: { $ref: "#/components/schemas/ToolCondition" },
          conditionOnReturn: { $ref: "#/components/schemas/ToolCondition", nullable: true },
          borrower: { type: "object", properties: { id: { $ref: "#/components/schemas/UUID" }, name: { type: "string" } } },
          returner: { type: "object", nullable: true, properties: { id: { $ref: "#/components/schemas/UUID" }, name: { type: "string" } } },
        },
      },
      AuditLog: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/UUID" },
          action: { $ref: "#/components/schemas/AuditAction" },
          entity: { type: "string", example: "MaterialIssue" },
          entityId: { type: "string", example: "550e8400-e29b-41d4-a716-446655440000" },
          oldValues: { type: "object", nullable: true, example: { status: "DRAFT" } },
          newValues: { type: "object", nullable: true, example: { status: "APPROVED" } },
          diff: { type: "object", nullable: true, example: { status: { before: "DRAFT", after: "APPROVED" } } },
          ipAddress: { type: "string", nullable: true, example: "192.168.1.10" },
          createdAt: { type: "string", format: "date-time" },
          user: { type: "object", nullable: true, properties: { id: { $ref: "#/components/schemas/UUID" }, name: { type: "string" }, employeeCode: { type: "string" } } },
        },
      },
    },
    parameters: {
      IdParam: {
        name: "id",
        in: "path",
        required: true,
        schema: { $ref: "#/components/schemas/UUID" },
        description: "UUID ของ record",
      },
      PageParam: { name: "page", in: "query", schema: { type: "integer", default: 1, minimum: 1 }, description: "หน้าที่ต้องการ" },
      LimitParam: { name: "limit", in: "query", schema: { type: "integer", default: 20, minimum: 1, maximum: 100 }, description: "จำนวนต่อหน้า" },
      SearchParam: { name: "search", in: "query", schema: { type: "string" }, description: "ค้นหาจากชื่อหรือรหัส" },
    },
    responses: {
      Unauthorized: {
        description: "ไม่มี token หรือ token ไม่ถูกต้อง",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" }, example: { success: false, message: "No token provided" } } },
      },
      Forbidden: {
        description: "ไม่มีสิทธิ์เข้าถึง",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" }, example: { success: false, message: "Access denied. Required roles: ADMIN" } } },
      },
      NotFound: {
        description: "ไม่พบข้อมูล",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" }, example: { success: false, message: "Record not found" } } },
      },
      ValidationError: {
        description: "ข้อมูลที่ส่งมาไม่ถูกต้อง",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
      },
      Conflict: {
        description: "ข้อมูลซ้ำ หรือ Concurrency conflict",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" }, example: { success: false, message: "Record was modified by another user. Please refresh and try again." } } },
      },
    },
  },
  security: [{ BearerAuth: [] }],
  tags: [
    { name: "Auth", description: "🔐 Authentication — เข้าสู่ระบบและจัดการบัญชีตัวเอง" },
    { name: "Users", description: "👤 จัดการผู้ใช้งาน (พนักงาน + ช่างเทคนิค)" },
    { name: "Departments", description: "🏢 จัดการแผนก" },
    { name: "Materials", description: "🔩 จัดการวัสดุและหมวดหมู่" },
    { name: "Suppliers", description: "🏭 จัดการผู้จำหน่าย" },
    { name: "Warehouses", description: "🏗️ จัดการคลังสินค้าและตำแหน่งจัดเก็บ" },
    { name: "Stock", description: "📦 ยอดสต็อก, Transaction, นับสต็อก" },
    { name: "Procurement", description: "🛒 Purchase Order, รับสินค้า, เบิกวัสดุ" },
    { name: "Tools", description: "🔧 จัดการเครื่องมือ ยืม-คืน" },
    { name: "Dashboard", description: "📊 Analytics & สถิติภาพรวม" },
    { name: "Barcode", description: "📱 QR Code / Barcode สำหรับ Mobile App" },
    { name: "PDF", description: "📄 Export เอกสารเป็น PDF" },
    { name: "Audit", description: "📝 ประวัติการแก้ไขและ Audit Trail" },
  ],
  paths: {
    ...authSpec,
    ...userSpec,
    ...materialSpec,
    ...supplierSpec,
    ...warehouseSpec,
    ...stockSpec,
    ...procurementSpec,
    ...toolSpec,
    ...dashboardSpec,
    ...barcodeSpec,
    ...pdfSpec,
    ...auditSpec,
  },
};

export default swaggerDefinition;
