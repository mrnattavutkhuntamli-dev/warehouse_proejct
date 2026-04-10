const auditSpec = {
  "/audit": {
    get: {
      tags: ["Audit"],
      summary: "ดู Audit Logs ทั้งหมด",
      description: `ดูประวัติทุก action ที่เกิดขึ้นในระบบ พร้อม filter ละเอียด

ใช้สำหรับ:
- ตรวจสอบเมื่อยอดสต็อกหาย
- ดูว่าใครอนุมัติหรือยกเลิก PO
- ติดตามพฤติกรรมผู้ใช้
- Compliance audit

**Role ที่ต้องการ: ADMIN, MANAGER**`,
      parameters: [
        { $ref: "#/components/parameters/PageParam" },
        { $ref: "#/components/parameters/LimitParam" },
        {
          name: "entity",
          in: "query",
          schema: { type: "string", example: "MaterialIssue" },
          description: "กรองตาม model เช่น `Stock`, `MaterialIssue`, `PurchaseOrder`, `Tool`",
        },
        {
          name: "entityId",
          in: "query",
          schema: { $ref: "#/components/schemas/UUID" },
          description: "กรองตาม record UUID เฉพาะเจาะจง",
        },
        {
          name: "userId",
          in: "query",
          schema: { $ref: "#/components/schemas/UUID" },
          description: "กรองตาม user ที่ทำ action",
        },
        {
          name: "action",
          in: "query",
          schema: { $ref: "#/components/schemas/AuditAction" },
          description: "กรองตามประเภท action",
        },
        {
          name: "from",
          in: "query",
          schema: { type: "string", format: "date-time", example: "2024-06-01T00:00:00Z" },
          description: "ดูตั้งแต่วันที่ (ISO string)",
        },
        {
          name: "to",
          in: "query",
          schema: { type: "string", format: "date-time", example: "2024-06-30T23:59:59Z" },
          description: "ดูถึงวันที่ (ISO string)",
        },
      ],
      responses: {
        200: {
          description: "รายการ Audit Logs",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/AuditLog" },
                  },
                  pagination: { $ref: "#/components/schemas/PaginationMeta" },
                },
              },
              example: {
                success: true,
                data: [
                  {
                    id: "uuid",
                    action: "ISSUE",
                    entity: "MaterialIssue",
                    entityId: "uuid-issue",
                    oldValues: { status: "APPROVED" },
                    newValues: { status: "ISSUED" },
                    diff: { status: { before: "APPROVED", after: "ISSUED" } },
                    ipAddress: "192.168.1.10",
                    createdAt: "2024-06-01T10:30:00Z",
                    user: { id: "uuid-user", name: "วิชัย มานะดี", employeeCode: "EMP003" },
                  },
                ],
                pagination: { total: 150, page: 1, limit: 20, totalPages: 8, hasNext: true, hasPrev: false },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
      },
    },
  },
  "/audit/stats": {
    get: {
      tags: ["Audit"],
      summary: "สถิติ Audit ย้อนหลัง",
      description: `สรุปสถิติการ action ในระบบ:
- breakdown ตาม entity + action type
- Top 10 users ที่ทำ action มากที่สุด

**Role ที่ต้องการ: ADMIN, MANAGER**`,
      parameters: [
        {
          name: "days",
          in: "query",
          schema: { type: "integer", default: 7, minimum: 1, maximum: 365 },
          description: "ย้อนหลังกี่วัน",
        },
      ],
      responses: {
        200: {
          description: "สถิติ Audit",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      period: { type: "string", example: "Last 7 days" },
                      actionBreakdown: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            action: { $ref: "#/components/schemas/AuditAction" },
                            entity: { type: "string", example: "MaterialIssue" },
                            count: { type: "integer", example: 12 },
                          },
                        },
                      },
                      topActiveUsers: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { $ref: "#/components/schemas/UUID" },
                            name: { type: "string", example: "วิชัย มานะดี" },
                            employee_code: { type: "string", example: "EMP003" },
                            action_count: { type: "integer", example: 45 },
                          },
                        },
                      },
                    },
                  },
                },
              },
              example: {
                data: {
                  period: "Last 7 days",
                  actionBreakdown: [
                    { action: "ISSUE", entity: "MaterialIssue", count: 18 },
                    { action: "CREATE", entity: "PurchaseOrder", count: 8 },
                    { action: "APPROVE", entity: "PurchaseOrder", count: 6 },
                  ],
                  topActiveUsers: [
                    { id: "uuid", name: "วิชัย มานะดี", employee_code: "EMP003", action_count: 45 },
                    { id: "uuid", name: "สมหญิง ดีงาม", employee_code: "EMP002", action_count: 32 },
                  ],
                },
              },
            },
          },
        },
        403: { $ref: "#/components/responses/Forbidden" },
      },
    },
  },
  "/audit/history/{entity}/{entityId}": {
    get: {
      tags: ["Audit"],
      summary: "Timeline ประวัติของ record",
      description: `ดูประวัติการเปลี่ยนแปลงทั้งหมดของ record เดียว เรียงตามเวลา

เหมาะสำหรับ:
- "ใบเบิกนี้ถูกแก้ไขโดยใครบ้าง?"
- "PO นี้ผ่านขั้นตอนอะไรมาบ้าง?"
- "stock ลดลงตอนไหน ใครเป็นคนทำ?"

**ตัวอย่าง entity ที่ใช้บ่อย:**
- \`MaterialIssue\`
- \`PurchaseOrder\`
- \`GoodsReceipt\`
- \`Stock\`
- \`Tool\`

**Role ที่ต้องการ: ADMIN, MANAGER**`,
      parameters: [
        {
          name: "entity",
          in: "path",
          required: true,
          schema: { type: "string", example: "MaterialIssue" },
          description: "ชื่อ model เช่น MaterialIssue, PurchaseOrder, Stock",
        },
        {
          name: "entityId",
          in: "path",
          required: true,
          schema: { $ref: "#/components/schemas/UUID" },
          description: "UUID ของ record",
        },
      ],
      responses: {
        200: {
          description: "Timeline ทั้งหมดของ record นี้ เรียงจากล่าสุดขึ้นก่อน",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/AuditLog" },
                  },
                },
              },
              example: {
                success: true,
                data: [
                  {
                    id: "uuid-3",
                    action: "ISSUE",
                    entity: "MaterialIssue",
                    entityId: "uuid-issue",
                    oldValues: { status: "APPROVED" },
                    newValues: { status: "ISSUED" },
                    diff: { status: { before: "APPROVED", after: "ISSUED" } },
                    createdAt: "2024-06-01T14:00:00Z",
                    user: { name: "วิชัย มานะดี", employeeCode: "EMP003" },
                  },
                  {
                    id: "uuid-2",
                    action: "APPROVE",
                    entity: "MaterialIssue",
                    entityId: "uuid-issue",
                    oldValues: { status: "DRAFT" },
                    newValues: { status: "APPROVED" },
                    diff: { status: { before: "DRAFT", after: "APPROVED" } },
                    createdAt: "2024-06-01T10:30:00Z",
                    user: { name: "สมหญิง ดีงาม", employeeCode: "EMP002" },
                  },
                  {
                    id: "uuid-1",
                    action: "CREATE",
                    entity: "MaterialIssue",
                    entityId: "uuid-issue",
                    oldValues: null,
                    newValues: { issueNo: "MI-20240601-001", purpose: "งานซ่อมบำรุง" },
                    diff: null,
                    createdAt: "2024-06-01T09:00:00Z",
                    user: { name: "ธนากร ขยันมาก", employeeCode: "EMP005" },
                  },
                ],
              },
            },
          },
        },
        403: { $ref: "#/components/responses/Forbidden" },
      },
    },
  },
};

export default auditSpec;
