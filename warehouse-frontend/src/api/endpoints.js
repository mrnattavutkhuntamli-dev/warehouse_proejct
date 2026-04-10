/**
 * API Endpoints — รวม path ทั้งหมดตาม OpenAPI 3.0 spec
 * ใช้ร่วมกับ axiosInstance
 *
 * Convention:
 *   - ฟังก์ชันที่รับ param จะ return string เช่น endpoints.users.byId("uuid")
 *   - ฟังก์ชันที่ไม่มี param จะเป็น string ตรง
 */

export const endpoints = {
  // ─── AUTH ────────────────────────────────────────────────────────────────
  auth: {
    login:          "/auth/login",
    profile:        "/auth/profile",
    changePassword: "/auth/change-password",
  },

  // ─── USERS & DEPARTMENTS ─────────────────────────────────────────────────
  users: {
    list:           "/users",
    byId:           (id) => `/users/${id}`,
    create:         "/users",
    update:         (id) => `/users/${id}`,
    remove:         (id) => `/users/${id}`,
    departments: {
      list:         "/users/departments",
      byId:         (id) => `/users/departments/${id}`,
      create:       "/users/departments",
      update:       (id) => `/users/departments/${id}`,
      remove:       (id) => `/users/departments/${id}`,
    },
  },

  // ─── MATERIALS ────────────────────────────────────────────────────────────
  materials: {
    list:           "/materials",
    byId:           (id) => `/materials/${id}`,
    create:         "/materials",
    update:         (id) => `/materials/${id}`,
    remove:         (id) => `/materials/${id}`,
    lowStock:       "/materials/low-stock",
    categories: {
      list:         "/materials/categories",
      create:       "/materials/categories",
      update:       (id) => `/materials/categories/${id}`,
      remove:       (id) => `/materials/categories/${id}`,
    },
  },

  // ─── SUPPLIERS ────────────────────────────────────────────────────────────
  suppliers: {
    list:           "/suppliers",
    byId:           (id) => `/suppliers/${id}`,
    create:         "/suppliers",
    update:         (id) => `/suppliers/${id}`,
    remove:         (id) => `/suppliers/${id}`,
  },

  // ─── WAREHOUSES & LOCATIONS ───────────────────────────────────────────────
  warehouses: {
    list:           "/warehouses",
    byId:           (id) => `/warehouses/${id}`,
    create:         "/warehouses",
    update:         (id) => `/warehouses/${id}`,
    remove:         (id) => `/warehouses/${id}`,
    locations: {
      list:         "/warehouses/locations",
      byId:         (id) => `/warehouses/locations/${id}`,
      create:       "/warehouses/locations",
      update:       (id) => `/warehouses/locations/${id}`,
      remove:       (id) => `/warehouses/locations/${id}`,
    },
  },

  // ─── STOCK ────────────────────────────────────────────────────────────────
  stock: {
    levels:         "/stock",
    transactions:   "/stock/transactions",
    createTx:       "/stock/transactions",
    counts: {
      list:         "/stock/counts",
      byId:         (id) => `/stock/counts/${id}`,
      create:       "/stock/counts",
      update:       (id) => `/stock/counts/${id}`,
    },
  },

  // ─── PROCUREMENT ─────────────────────────────────────────────────────────
  procurement: {
    po: {
      list:         "/procurement/purchase-orders",
      byId:         (id) => `/procurement/purchase-orders/${id}`,
      create:       "/procurement/purchase-orders",
      updateStatus: (id) => `/procurement/purchase-orders/${id}/status`,
    },
    gr: {
      list:         "/procurement/goods-receipts",
      byId:         (id) => `/procurement/goods-receipts/${id}`,
      create:       "/procurement/goods-receipts",
    },
    issue: {
      list:         "/procurement/material-issues",
      byId:         (id) => `/procurement/material-issues/${id}`,
      create:       "/procurement/material-issues",
      updateStatus: (id) => `/procurement/material-issues/${id}/status`,
    },
  },

  // ─── TOOLS ────────────────────────────────────────────────────────────────
  tools: {
    list:           "/tools",
    byId:           (id) => `/tools/${id}`,
    create:         "/tools",
    update:         (id) => `/tools/${id}`,
    remove:         (id) => `/tools/${id}`,
    borrow:         (id) => `/tools/${id}/borrow`,
    borrowRecords:  "/tools/borrow-records",
    returnTool:     (recordId) => `/tools/borrow-records/${recordId}/return`,
    categories: {
      list:         "/tools/categories",
      create:       "/tools/categories",
      update:       (id) => `/tools/categories/${id}`,
      remove:       (id) => `/tools/categories/${id}`,
    },
  },

  // ─── DASHBOARD ────────────────────────────────────────────────────────────
  dashboard: {
    overview:       "/dashboard/overview",
    inventoryValue: "/dashboard/inventory-value",
    topIssued:      "/dashboard/top-issued-materials",
    supplierStats:  "/dashboard/supplier-stats",
    stockMovement:  "/dashboard/stock-movement",
    toolUtil:       "/dashboard/tool-utilization",
  },

  // ─── BARCODE ──────────────────────────────────────────────────────────────
  barcode: {
    scan:           "/barcode/scan",
    bulk:           "/barcode/bulk",
    material:       (id) => `/barcode/material/${id}`,
    location:       (id) => `/barcode/location/${id}`,
    tool:           (id) => `/barcode/tool/${id}`,
  },

  // ─── PDF ──────────────────────────────────────────────────────────────────
  pdf: {
    purchaseOrder:  (id) => `/pdf/purchase-orders/${id}`,
    materialIssue:  (id) => `/pdf/material-issues/${id}`,
    goodsReceipt:   (id) => `/pdf/goods-receipts/${id}`,
  },

  // ─── AUDIT ────────────────────────────────────────────────────────────────
  audit: {
    list:           "/audit",
    stats:          "/audit/stats",
    history:        (entity, entityId) => `/audit/history/${entity}/${entityId}`,
  },
};
