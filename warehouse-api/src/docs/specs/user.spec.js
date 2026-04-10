const paginatedUsers = {
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    data: { type: "array", items: { $ref: "#/components/schemas/User" } },
    pagination: { $ref: "#/components/schemas/PaginationMeta" },
  },
};

const userSpec = {
  // ── DEPARTMENTS ──────────────────────────────────────────────────────────────
  "/users/departments": {
    get: {
      tags: ["Departments"],
      summary: "List แผนกทั้งหมด",
      description: "ดึงรายการแผนกทั้งหมดพร้อมจำนวนพนักงานในแต่ละแผนก",
      responses: {
        200: {
          description: "รายการแผนก",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  data: {
                    type: "array",
                    items: {
                      allOf: [
                        { $ref: "#/components/schemas/Department" },
                        { type: "object", properties: { _count: { type: "object", properties: { users: { type: "integer", example: 5 } } } } },
                      ],
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
    post: {
      tags: ["Departments"],
      summary: "สร้างแผนกใหม่",
      description: "สร้างแผนกใหม่ในระบบ **Role ที่ต้องการ: ADMIN, MANAGER**",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name"],
              properties: { name: { type: "string", example: "ฝ่ายซ่อมบำรุง" } },
            },
          },
        },
      },
      responses: {
        201: { description: "สร้างแผนกสำเร็จ" },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        409: { description: "ชื่อแผนกซ้ำ" },
      },
    },
  },
  "/users/departments/{id}": {
    get: {
      tags: ["Departments"],
      summary: "รายละเอียดแผนก",
      description: "ดูข้อมูลแผนกพร้อมรายชื่อพนักงานทั้งหมดในแผนก",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: {
        200: { description: "ข้อมูลแผนก + รายชื่อพนักงาน" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    put: {
      tags: ["Departments"],
      summary: "แก้ไขแผนก",
      description: "**Role ที่ต้องการ: ADMIN, MANAGER**",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { type: "object", required: ["name"], properties: { name: { type: "string", example: "ฝ่ายซ่อมบำรุงและสาธารณูปโภค" } } } } },
      },
      responses: { 200: { description: "แก้ไขสำเร็จ" }, 404: { $ref: "#/components/responses/NotFound" } },
    },
    delete: {
      tags: ["Departments"],
      summary: "ลบแผนก",
      description: "ลบแผนกออกจากระบบ — **จะ Error ถ้ายังมีพนักงานอยู่** **Role ที่ต้องการ: ADMIN**",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: {
        200: { description: "ลบสำเร็จ" },
        400: { description: "ไม่สามารถลบได้ เนื่องจากยังมีพนักงานอยู่ในแผนก" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },

  // ── USERS ─────────────────────────────────────────────────────────────────────
  "/users": {
    get: {
      tags: ["Users"],
      summary: "List พนักงานทั้งหมด",
      description: "ดึงรายชื่อพนักงานพร้อม pagination และ filter หลายแบบ **Role ที่ต้องการ: ADMIN, MANAGER**",
      parameters: [
        { $ref: "#/components/parameters/PageParam" },
        { $ref: "#/components/parameters/LimitParam" },
        { $ref: "#/components/parameters/SearchParam" },
        { name: "role", in: "query", schema: { $ref: "#/components/schemas/Role" }, description: "กรองตาม role" },
        { name: "isActive", in: "query", schema: { type: "string", enum: ["true", "false"] }, description: "กรองตามสถานะ active" },
        { name: "departmentId", in: "query", schema: { $ref: "#/components/schemas/UUID" }, description: "กรองตามแผนก" },
      ],
      responses: {
        200: { description: "รายชื่อพนักงาน", content: { "application/json": { schema: paginatedUsers } } },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
      },
    },
    post: {
      tags: ["Users"],
      summary: "สร้างพนักงานใหม่",
      description: "สร้างพนักงานใหม่ — password จะถูก hash อัตโนมัติ ถ้า role=TECHNICIAN จะสร้าง Technician profile ด้วย **Role ที่ต้องการ: ADMIN**",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["employeeCode", "name", "email", "password"],
              properties: {
                employeeCode: { type: "string", example: "EMP021" },
                name: { type: "string", example: "สมศักดิ์ ทองดี" },
                email: { type: "string", format: "email", example: "somsak@example.com" },
                password: { type: "string", minLength: 6, example: "password123" },
                phone: { type: "string", example: "0891234567" },
                role: { $ref: "#/components/schemas/Role" },
                departmentId: { $ref: "#/components/schemas/UUID" },
                technician: {
                  type: "object",
                  description: "ต้องส่งถ้า role=TECHNICIAN",
                  properties: {
                    skillLevel: { $ref: "#/components/schemas/SkillLevel" },
                    shift: { $ref: "#/components/schemas/Shift" },
                    specialty: { type: "string", example: "ไฟฟ้า" },
                  },
                },
              },
            },
            examples: {
              staff: { summary: "สร้าง STAFF", value: { employeeCode: "EMP021", name: "สมศักดิ์ ทองดี", email: "somsak@example.com", password: "password123", role: "STAFF", departmentId: "uuid-here" } },
              technician: { summary: "สร้าง TECHNICIAN", value: { employeeCode: "EMP022", name: "ช่างกิตติ", email: "kitti@example.com", password: "password123", role: "TECHNICIAN", technician: { skillLevel: "MID", shift: "MORNING", specialty: "ไฟฟ้า" } } },
            },
          },
        },
      },
      responses: {
        201: { description: "สร้างพนักงานสำเร็จ" },
        400: { $ref: "#/components/responses/ValidationError" },
        403: { $ref: "#/components/responses/Forbidden" },
        409: { description: "employeeCode หรือ email ซ้ำ" },
      },
    },
  },
  "/users/{id}": {
    get: {
      tags: ["Users"],
      summary: "รายละเอียดพนักงาน",
      description: "ดูข้อมูลพนักงานคนเดียว พร้อม department และ technician profile",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: {
        200: { description: "ข้อมูลพนักงาน", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/User" } } } } } },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    put: {
      tags: ["Users"],
      summary: "แก้ไขพนักงาน",
      description: "แก้ไขข้อมูลพนักงาน ถ้าส่ง `technician` มาจะทำการ upsert **Role ที่ต้องการ: ADMIN, MANAGER**",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                phone: { type: "string" },
                role: { $ref: "#/components/schemas/Role" },
                departmentId: { $ref: "#/components/schemas/UUID" },
                isActive: { type: "boolean" },
                technician: {
                  type: "object",
                  properties: {
                    skillLevel: { $ref: "#/components/schemas/SkillLevel" },
                    shift: { $ref: "#/components/schemas/Shift" },
                    specialty: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      responses: { 200: { description: "แก้ไขสำเร็จ" }, 404: { $ref: "#/components/responses/NotFound" } },
    },
    delete: {
      tags: ["Users"],
      summary: "ปิดใช้งานพนักงาน",
      description: "Soft delete — ตั้ง isActive=false ไม่ได้ลบจริง **Role ที่ต้องการ: ADMIN**",
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "ปิดใช้งานสำเร็จ" }, 404: { $ref: "#/components/responses/NotFound" } },
    },
  },
};

export default userSpec;
