# WarehouseOS 🏭

> **EN:** A full-stack Warehouse Management System built with Node.js (Express.js), PostgreSQL, and React.js — covering materials, stock, procurement, tools, and analytics in one platform.
>
> **TH:** ระบบจัดการคลังสินค้าแบบครบวงจร สร้างด้วย Node.js (Express.js), PostgreSQL และ React.js ครอบคลุมทั้งวัสดุ สต็อก จัดซื้อ เครื่องมือ และ Analytics

![Version](https://img.shields.io/badge/version-1.0.0-orange)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.x-brightgreen)
![Express](https://img.shields.io/badge/Express.js-4.x-lightgrey)
![React](https://img.shields.io/badge/React.js-18.x-61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Screenshots](#-screenshots)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Role & Permissions](#-role--permissions)
- [Project Structure](#-project-structure)
- [License](#-license)

---

## 🌟 Overview

**EN:**
WarehouseOS is designed for manufacturing and industrial environments. It handles the full lifecycle of materials — from purchase order to goods receipt, stock management, and material issuance — while also tracking tools and providing real-time analytics.

**TH:**
WarehouseOS ออกแบบสำหรับโรงงานและอุตสาหกรรม ครอบคลุมวงจรชีวิตของวัสดุทั้งหมด ตั้งแต่ใบสั่งซื้อ การรับสินค้า การจัดการสต็อก การเบิกวัสดุ ติดตามเครื่องมือ และ Dashboard Analytics แบบ Real-time

### ✅ Key Features

| Feature | Description (EN) | คำอธิบาย (TH) |
|---|---|---|
| 📦 Materials & Stock | Track materials with low-stock alerts | จัดการวัสดุ แจ้งเตือนสต็อกต่ำ |
| 🏗️ Warehouses & Locations | Multi-warehouse with location mapping | คลังหลายแห่ง พร้อม Location Code |
| 🛒 Purchase Orders (PO) | Full procurement workflow with approval | ใบสั่งซื้อ พร้อม Workflow อนุมัติ |
| 📥 Goods Receipts (GR) | Receive stock against PO | รับสินค้าเข้าคลัง อ้างอิง PO |
| 📤 Material Issues | Requisition and issuance tracking | ใบเบิกวัสดุ พร้อม Workflow |
| 🔧 Tool Management | Borrow/return tracking with utilization | ยืม-คืนเครื่องมือ + Analytics |
| 📊 Dashboard | Stock movement, inventory value, KPIs | ภาพรวมระบบ และ Analytics |
| 📱 Barcode / QR Code | Scan materials, locations, and tools | สแกน QR สำหรับ Mobile |
| 📄 PDF Export | Export PO, GR, Material Issue as PDF | Export เอกสารเป็น PDF |
| 📝 Audit Log | Full audit trail for all actions | บันทึกทุกการกระทำในระบบ |
| 👤 RBAC | 4-level role-based access control | ระบบสิทธิ์ 4 ระดับ |

---

## 📸 Screenshots

### Dashboard
![Dashboard](docs/screenshots/01-dashboard.png)
> Real-time KPIs: total materials, low stock alerts, PO status, tool availability, inventory value, and stock movement trend.

### Materials & Stock
![Materials](docs/screenshots/02-materials.png)
> Full material list with stock levels, low-stock indicators, category filter, and status toggle.

### Warehouses & Locations
![Warehouses](docs/screenshots/03-warehouses.png)
![Locations](docs/screenshots/04-locations.png)
> Multi-warehouse management with named location codes (e.g. A-01-01, B-02-01).

### Purchase Orders
![PO](docs/screenshots/05-purchase-orders.png)
> PO workflow: Draft → Approved → Partially Received → Fully Received.

### Goods Receipt & Material Issue
![GR](docs/screenshots/06-goods-receipt.png)
![Issue](docs/screenshots/07-material-issue.png)

### Tools, Suppliers & Audit
![Tools](docs/screenshots/08-tools.png)
![Suppliers](docs/screenshots/09-suppliers.png)
![Audit](docs/screenshots/10-audit-logs.png)

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Client (React.js)                   │
│            SPA  ·  Tailwind CSS  ·  Axios            │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS / REST
┌────────────────────▼────────────────────────────────┐
│             API Server (Node.js + Express.js)        │
│                                                      │
│  Auth (JWT)  ·  Middleware (RBAC)  ·  Validation     │
│                                                      │
│  Routers:                                            │
│  Users · Materials · Warehouses · Stock              │
│  Procurement · Tools · Dashboard · Audit             │
│  Barcode · PDF Export                                │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              PostgreSQL Database                     │
│                                                      │
│  users · departments · materials · categories        │
│  warehouses · locations · stock · stock_transactions │
│  purchase_orders · goods_receipts · material_issues  │
│  tools · borrow_records · audit_logs · suppliers     │
└─────────────────────────────────────────────────────┘
```

### Procurement Workflow / Workflow จัดซื้อ

```
[Create PO] → [DRAFT] → [APPROVED] → [Receive GR] → [PARTIALLY_RECEIVED]
                                                   → [FULLY_RECEIVED]
                         [CANCELLED]
```

### Material Issue Workflow

```
[Create] → [DRAFT] → [APPROVED] → [ISSUED]
                   → [CANCELLED]
```

---

## 🗄️ Entity Relationship (ER Diagram)

> Core tables only — simplified for readability.

```
users ──────────────< purchase_orders
  │                         │
  └──< material_issues      └──< goods_receipts
           │                         │
           └──< stock_transactions ──┘
                     │
               materials >──< categories
                     │
               warehouses >──< locations
                     │
                  stock (current balance per material+location)

tools >──< borrow_records >──< users
tools >──< tool_categories

audit_logs (entity, entityId, action, userId, ip, timestamp)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend Framework | Express.js (Node.js) |
| Language | JavaScript / TypeScript |
| Database | PostgreSQL 15 |
| Query Builder | Knex.js / node-postgres (pg) |
| Authentication | JWT (Bearer Token) |
| Frontend | React.js + Tailwind CSS |
| PDF Generation | PDFKit / Puppeteer |
| API Spec | OpenAPI 3.0 (Swagger) |
| Containerization | Docker + Docker Compose |

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 15
- npm or yarn
- Docker (optional but recommended)

---

### Option A: Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/mrnattavutkhuntamli-dev/warehouseos.git
cd warehouseos

# 2. Copy environment files
cp warehouse-api/.env.example warehouse-api/.env
cp warehouse-frontend/.env.example warehouse-frontend/.env

# 3. Start all services
docker-compose up -d

# API will be available at: http://localhost:3000/api/v1
# Frontend will be available at: http://localhost:5173
# Swagger UI: http://localhost:3000/api/docs
```

---

### Option B: Manual Setup

#### 1. Setup Backend (warehouse-api)

```bash
cd warehouse-api

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials
```

**.env example:**
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=warehouseos

JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
```

```bash
# Run database migrations
npm run migrate

# Seed initial data (optional)
npm run seed

# Start development server
npm run dev
```

#### 2. Setup Frontend (warehouse-frontend)

```bash
cd warehouse-frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

**.env example:**
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

```bash
# Start development server
npm run dev
```

---

### Default Admin Account

After seeding, log in with:

```
Email:    admin@example.com
Password: Admin@1234
```

> ⚠️ Change the password immediately after first login.

---

## 📡 API Reference

Base URL: `http://localhost:3000/api/v1`

All endpoints (except `/auth/login`) require:
```
Authorization: Bearer <token>
```

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Login and receive JWT token |
| GET | `/auth/profile` | Get current user profile |
| PATCH | `/auth/change-password` | Change own password |

### Users & Departments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | List all users |
| POST | `/users` | Create a new user |
| GET | `/users/{id}` | Get user detail |
| PUT | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Deactivate user |
| GET | `/users/departments` | List all departments |
| POST | `/users/departments` | Create department |
| PUT | `/users/departments/{id}` | Update department |
| DELETE | `/users/departments/{id}` | Delete department |

### Materials

| Method | Endpoint | Description |
|---|---|---|
| GET | `/materials` | List all materials |
| POST | `/materials` | Create material |
| GET | `/materials/{id}` | Get material detail |
| PUT | `/materials/{id}` | Update material |
| DELETE | `/materials/{id}` | Deactivate material |
| GET | `/materials/low-stock` | ⚠️ Low stock alerts |
| GET | `/materials/categories` | List categories |
| POST | `/materials/categories` | Create category |
| PUT | `/materials/categories/{id}` | Update category |
| DELETE | `/materials/categories/{id}` | Delete category |

### Warehouses & Locations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/warehouses` | List all warehouses |
| POST | `/warehouses` | Create warehouse |
| GET | `/warehouses/{id}` | Get warehouse detail |
| PUT | `/warehouses/{id}` | Update warehouse |
| DELETE | `/warehouses/{id}` | Deactivate warehouse |
| GET | `/warehouses/locations` | List all locations |
| POST | `/warehouses/locations` | Create location |
| GET | `/warehouses/locations/{id}` | Get location detail |
| PUT | `/warehouses/locations/{id}` | Update location |
| DELETE | `/warehouses/locations/{id}` | Deactivate location |

### Suppliers

| Method | Endpoint | Description |
|---|---|---|
| GET | `/suppliers` | List all suppliers |
| POST | `/suppliers` | Create supplier |
| GET | `/suppliers/{id}` | Get supplier detail |
| PUT | `/suppliers/{id}` | Update supplier |
| DELETE | `/suppliers/{id}` | Deactivate supplier |

### Stock

| Method | Endpoint | Description |
|---|---|---|
| GET | `/stock` | Current stock balances |
| GET | `/stock/transactions` | Stock transaction history |
| POST | `/stock/transactions` | Create manual stock transaction |
| GET | `/stock/counts` | List stock counts |
| POST | `/stock/counts` | Start a new stock count |
| GET | `/stock/counts/{id}` | Get stock count detail |
| PUT | `/stock/counts/{id}` | Update / change status |

### Procurement

| Method | Endpoint | Description |
|---|---|---|
| GET | `/procurement/purchase-orders` | List all POs |
| POST | `/procurement/purchase-orders` | Create PO |
| GET | `/procurement/purchase-orders/{id}` | Get PO detail |
| PATCH | `/procurement/purchase-orders/{id}/status` | Change PO status |
| GET | `/procurement/goods-receipts` | List all GRs |
| POST | `/procurement/goods-receipts` | Create GR (receive stock) |
| GET | `/procurement/goods-receipts/{id}` | Get GR detail |
| GET | `/procurement/material-issues` | List all material issues |
| POST | `/procurement/material-issues` | Create material issue |
| GET | `/procurement/material-issues/{id}` | Get material issue detail |
| PATCH | `/procurement/material-issues/{id}/status` | Change issue status |

### Tools

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tools` | List all tools |
| POST | `/tools` | Add tool |
| GET | `/tools/{id}` | Get tool detail |
| PUT | `/tools/{id}` | Update tool |
| DELETE | `/tools/{id}` | Deactivate tool |
| POST | `/tools/{id}/borrow` | Borrow a tool |
| PATCH | `/tools/borrow-records/{id}/return` | Return a tool |
| GET | `/tools/borrow-records` | Borrow history |
| GET | `/tools/categories` | List tool categories |
| POST | `/tools/categories` | Create category |

### Dashboard & Analytics

| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/overview` | System overview KPIs |
| GET | `/dashboard/inventory-value` | Total inventory value |
| GET | `/dashboard/top-issued-materials` | Most issued materials |
| GET | `/dashboard/supplier-stats` | Supplier statistics |
| GET | `/dashboard/stock-movement` | Stock movement trend |
| GET | `/dashboard/tool-utilization` | Tool utilization rate |

### Barcode & PDF

| Method | Endpoint | Description |
|---|---|---|
| POST | `/barcode/scan` | Scan QR / Barcode |
| GET | `/barcode/material/{id}` | Material barcode payload |
| GET | `/barcode/location/{id}` | Location barcode payload |
| GET | `/barcode/tool/{id}` | Tool barcode payload |
| GET | `/pdf/purchase-orders/{id}` | Export PO as PDF |
| GET | `/pdf/material-issues/{id}` | Export material issue as PDF |
| GET | `/pdf/goods-receipts/{id}` | Export GR as PDF |

### Audit Log

| Method | Endpoint | Description |
|---|---|---|
| GET | `/audit` | View all audit logs (Admin/Manager) |
| GET | `/audit/stats` | Audit statistics |
| GET | `/audit/history/{entity}/{entityId}` | Record history timeline |

> Full Swagger documentation available at: `http://localhost:3000/api/docs`

---

## 🔐 Role & Permissions

| Feature | ADMIN | MANAGER | STAFF | TECHNICIAN |
|---|:---:|:---:|:---:|:---:|
| Manage users & departments | ✅ | ❌ | ❌ | ❌ |
| Create / edit master data | ✅ | ✅ | ❌ | ❌ |
| Approve PO / Material Issue | ✅ | ✅ | ❌ | ❌ |
| Create PO / GR / Material Issue | ✅ | ✅ | ✅ | ❌ |
| View stock & materials | ✅ | ✅ | ✅ | ✅ |
| Borrow / return tools | ✅ | ✅ | ✅ | ✅ |
| View Audit Logs | ✅ | ✅ | ❌ | ❌ |
| Delete records | ✅ | ❌ | ❌ | ❌ |

---

## 📁 Project Structure

```
warehouseos/
├── warehouse-api/              # Express.js Backend
│   ├── src/
│   │   ├── middlewares/        # Auth (JWT), RBAC, Error handler
│   │   ├── routes/             # Express routers
│   │   │   ├── auth.routes.js
│   │   │   ├── users.routes.js
│   │   │   ├── materials.routes.js
│   │   │   ├── warehouses.routes.js
│   │   │   ├── stock.routes.js
│   │   │   ├── procurement.routes.js
│   │   │   ├── tools.routes.js
│   │   │   ├── suppliers.routes.js
│   │   │   ├── dashboard.routes.js
│   │   │   ├── barcode.routes.js
│   │   │   ├── pdf.routes.js
│   │   │   └── audit.routes.js
│   │   ├── controllers/        # Business logic
│   │   ├── services/           # Data access layer
│   │   ├── db/                 # DB connection, migrations, seeds
│   │   └── app.js              # Express app entry point
│   ├── .env.example
│   └── package.json
│
├── warehouse-frontend/         # React.js Frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/           # Axios API calls
│   │   ├── context/            # React Context / state
│   │   └── App.jsx
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 📄 License

MIT License — feel free to use this project for learning and portfolio purposes.

---

<p align="center">
  Built with ❤️ · WarehouseOS v1.0.0
</p>
