# Warehouse Management System — Backend API

Express.js + Prisma + PostgreSQL + Zod — ESM (`"type": "module"`)

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit DATABASE_URL and JWT_SECRET

# 3. Generate Prisma client & migrate
npm run prisma:generate
npm run prisma:migrate

# 4. Start dev server
npm run dev
```

---

## 📁 Project Structure

```
src/
├── config/
│   └── prisma.js             # Prisma client singleton
├── middleware/
│   ├── authMiddleware.js     # JWT authenticate + authorize(roles)
│   ├── errorMiddleware.js    # Global error handler + AppError class
│   └── validateMiddleware.js # validate(schema) + validateQuery(schema)
├── modules/
│   ├── auth/                 # Login, profile, change password
│   ├── user/                 # Users CRUD + Technician upsert
│   ├── department/           # Departments CRUD
│   ├── material/             # Materials + Categories + Low-stock alert
│   ├── supplier/             # Suppliers CRUD
│   ├── warehouse/            # Warehouses + Locations CRUD
│   ├── stock/                # Stock levels, Transactions, Stock Counts
│   ├── procurement/          # Purchase Orders, Goods Receipts, Material Issues
│   └── tool/                 # Tools + Categories + Borrow/Return
├── routes/
│   ├── index.js              # Mounts all routers under /api/v1
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── material.routes.js
│   ├── supplier.routes.js
│   ├── warehouse.routes.js
│   ├── stock.routes.js
│   ├── procurement.routes.js
│   └── tool.routes.js
├── utils/
│   ├── response.js           # successResponse, errorResponse, paginatedResponse
│   ├── pagination.js         # getPagination, buildPaginationMeta
│   └── generateCode.js       # Auto-generate codes (PO-YYYYMMDD-XXXX)
├── app.js                    # Express app config
└── server.js                 # Entry point with graceful shutdown
```

---

## 🔐 Authentication

All routes except `/api/v1/auth/login` require a Bearer token.

```
Authorization: Bearer <token>
```

### Role Hierarchy
| Role        | Access Level |
|-------------|-------------|
| `ADMIN`     | Full access |
| `MANAGER`   | Create/Edit most resources, approve documents |
| `STAFF`     | Create requests, view data |
| `TECHNICIAN`| View data, borrow tools |

---

## 📡 API Endpoints

### Auth — `/api/v1/auth`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/login` | Login → returns JWT |
| GET | `/profile` | Get current user profile |
| PATCH | `/change-password` | Change own password |

### Users — `/api/v1/users`
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/` | ADMIN, MANAGER | List users (paginated, searchable) |
| GET | `/:id` | Auth | Get user by ID |
| POST | `/` | ADMIN | Create user (+ optional technician) |
| PUT | `/:id` | ADMIN, MANAGER | Update user |
| DELETE | `/:id` | ADMIN | Deactivate user |
| GET | `/departments` | Auth | List departments |
| GET | `/departments/:id` | Auth | Get department |
| POST | `/departments` | ADMIN, MANAGER | Create department |
| PUT | `/departments/:id` | ADMIN, MANAGER | Update department |
| DELETE | `/departments/:id` | ADMIN | Delete department |

### Materials — `/api/v1/materials`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/categories` | List categories |
| POST | `/categories` | Create category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |
| GET | `/low-stock` | Materials below minStock |
| GET | `/` | List materials (filter: search, categoryId, isActive) |
| GET | `/:id` | Get material with stock levels |
| POST | `/` | Create material |
| PUT | `/:id` | Update material |
| DELETE | `/:id` | Deactivate material |

### Suppliers — `/api/v1/suppliers`
Standard CRUD with pagination + search.

### Warehouses — `/api/v1/warehouses`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/locations` | List locations (filter: warehouseId) |
| GET | `/locations/:id` | Get location with stock |
| POST | `/locations` | Create location |
| PUT | `/locations/:id` | Update location |
| DELETE | `/locations/:id` | Deactivate location |
| GET | `/` | List warehouses |
| GET | `/:id` | Get warehouse with locations |
| POST | `/` | Create warehouse |
| PUT | `/:id` | Update warehouse |

### Stock — `/api/v1/stock`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Current stock levels (filter: materialId, locationId) |
| GET | `/transactions` | Stock transaction history |
| POST | `/transactions` | Manual stock transaction |
| GET | `/counts` | List stock counts |
| GET | `/counts/:id` | Get stock count detail |
| POST | `/counts` | Create stock count |
| PUT | `/counts/:id` | Update stock count / complete |

### Procurement — `/api/v1/procurement`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/purchase-orders` | List POs |
| POST | `/purchase-orders` | Create PO |
| GET | `/purchase-orders/:id` | Get PO detail |
| PATCH | `/purchase-orders/:id/status` | Approve / Cancel PO |
| GET | `/goods-receipts` | List GRs |
| POST | `/goods-receipts` | Receive goods (auto updates stock + PO status) |
| GET | `/goods-receipts/:id` | Get GR detail |
| GET | `/material-issues` | List material issues |
| POST | `/material-issues` | Create material issue request |
| GET | `/material-issues/:id` | Get material issue detail |
| PATCH | `/material-issues/:id/status` | Approve / Issue / Cancel (ISSUED deducts stock) |

### Tools — `/api/v1/tools`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/categories` | List tool categories |
| POST | `/categories` | Create category |
| GET | `/borrow-records` | List borrow records (filter: toolId, borrowedBy, active=true) |
| PATCH | `/borrow-records/:id/return` | Return a tool |
| GET | `/` | List tools (filter: status, categoryId, search) |
| GET | `/:id` | Get tool with borrow history |
| POST | `/` | Create tool |
| PUT | `/:id` | Update tool |
| POST | `/:id/borrow` | Borrow a tool |

---

## 📦 Response Format

```json
// Success
{ "success": true, "message": "...", "data": {} }

// Paginated
{ "success": true, "message": "...", "data": [], "pagination": { "total": 100, "page": 1, "limit": 20, "totalPages": 5, "hasNext": true, "hasPrev": false } }

// Error
{ "success": false, "message": "...", "errors": [{ "field": "email", "message": "Invalid email" }] }
```

## 🔍 Query Parameters (pagination)
- `page` — page number (default: 1)
- `limit` — items per page (default: 20, max: 100)
- `search` — text search (where supported)
