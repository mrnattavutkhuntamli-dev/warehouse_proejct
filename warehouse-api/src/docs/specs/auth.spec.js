const authSpec = {
  "/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "เข้าสู่ระบบ",
      description: "รับ email + password แล้วคืน JWT token สำหรับใช้กับ API อื่นๆ",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", format: "email", example: "somchai@example.com" },
                password: { type: "string", minLength: 6, example: "password123" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "เข้าสู่ระบบสำเร็จ",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Login successful" },
                  data: {
                    type: "object",
                    properties: {
                      token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                      user: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { description: "Email หรือ Password ไม่ถูกต้อง", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" }, example: { success: false, message: "Invalid credentials" } } } },
      },
    },
  },
  "/auth/profile": {
    get: {
      tags: ["Auth"],
      summary: "ดูข้อมูลตัวเอง",
      description: "ดูข้อมูล profile ของ user ที่ login อยู่ พร้อม department และ technician (ถ้ามี)",
      responses: {
        200: {
          description: "ข้อมูล profile",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
  "/auth/change-password": {
    patch: {
      tags: ["Auth"],
      summary: "เปลี่ยนรหัสผ่านตัวเอง",
      description: "เปลี่ยนรหัสผ่านของตัวเอง ต้องใส่รหัสผ่านเก่าเพื่อยืนยัน",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["currentPassword", "newPassword"],
              properties: {
                currentPassword: { type: "string", example: "password123" },
                newPassword: { type: "string", minLength: 6, example: "newSecurePass456" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "เปลี่ยนรหัสผ่านสำเร็จ" },
        400: { description: "รหัสผ่านเก่าไม่ถูกต้อง", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
};

export default authSpec;
