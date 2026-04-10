import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config";
import swaggerUi from "swagger-ui-express";

import router from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import swaggerDefinition from "./docs/swagger.js";

const app = express();

// Security
// ต้อง config helmet ให้รองรับ swagger-ui inline script
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
      },
    },
  })
);
app.use(cors());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── SWAGGER UI ──────────────────────────────────────────────────────────────
const swaggerUiOptions = {
  customSiteTitle: "🏭 Warehouse API Docs",
  customCss: `
    .swagger-ui .topbar { background-color: #1a1a2e; padding: 8px 0; }
    .swagger-ui .topbar .download-url-wrapper { display: none; }
    .swagger-ui .info .title { color: #1a1a2e; font-size: 2rem; }
    .swagger-ui .scheme-container { background: #f8f9fa; padding: 12px 20px; border-radius: 6px; }
    .swagger-ui .opblock-tag { font-size: 1.1rem; }
  `,
  swaggerOptions: {
    persistAuthorization: true,   // จำ JWT token ไว้แม้ refresh หน้า
    displayRequestDuration: true, // แสดงเวลา response ใน ms
    filter: true,                 // ช่องค้นหา endpoint
    deepLinking: true,            // URL เปลี่ยนตาม tag/endpoint ที่เปิด
    tryItOutEnabled: true,        // เปิด "Try it out" ทุก endpoint อัตโนมัติ
    defaultModelsExpandDepth: 1,  // ขยาย Schema 1 ชั้น
  },
};

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDefinition, swaggerUiOptions));

// Raw JSON spec — import เข้า Postman / Insomnia ได้เลย
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerDefinition);
});

// ── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    docs: "/api-docs",
    spec: "/api-docs.json",
  });
});

// ── API ROUTES ──────────────────────────────────────────────────────────────
app.use("/api/v1", router);

// ── ERROR HANDLING ──────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
