/**
 * Query Key Factory — centralized key management for TanStack Query
 *
 * Ensures consistent cache invalidation:
 *   qc.invalidateQueries({ queryKey: queryKeys.materials.all })
 *   qc.invalidateQueries({ queryKey: queryKeys.materials.detail(id) })
 */
export const queryKeys = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    profile: ["auth", "profile"],
  },

  // ── Users ─────────────────────────────────────────────────────────────────
  users: {
    all:    ["users"],
    list:   (params) => ["users", "list", params],
    detail: (id)     => ["users", id],
    departments: {
      all:    ["users", "departments"],
      list:   (params) => ["users", "departments", "list", params],
      detail: (id)     => ["users", "departments", id],
    },
  },

  // ── Materials ─────────────────────────────────────────────────────────────
  materials: {
    all:       ["materials"],
    list:      (params) => ["materials", "list", params],
    detail:    (id)     => ["materials", id],
    lowStock:  ["materials", "low-stock"],
    categories: {
      all:  ["materials", "categories"],
      list: (params) => ["materials", "categories", "list", params],
    },
  },

  // ── Suppliers ─────────────────────────────────────────────────────────────
  suppliers: {
    all:    ["suppliers"],
    list:   (params) => ["suppliers", "list", params],
    detail: (id)     => ["suppliers", id],
  },

  // ── Warehouses ────────────────────────────────────────────────────────────
  warehouses: {
    all:    ["warehouses"],
    list:   (params) => ["warehouses", "list", params],
    detail: (id)     => ["warehouses", id],
    locations: {
      all:    ["warehouses", "locations"],
      list:   (params) => ["warehouses", "locations", "list", params],
      detail: (id)     => ["warehouses", "locations", id],
    },
  },

  // ── Stock ─────────────────────────────────────────────────────────────────
  stock: {
    levels:       (params) => ["stock", "levels", params],
    transactions: (params) => ["stock", "transactions", params],
    counts: {
      all:    ["stock", "counts"],
      list:   (params) => ["stock", "counts", "list", params],
      detail: (id)     => ["stock", "counts", id],
    },
  },

  // ── Procurement ───────────────────────────────────────────────────────────
  procurement: {
    po: {
      all:    ["procurement", "po"],
      list:   (params) => ["procurement", "po", "list", params],
      detail: (id)     => ["procurement", "po", id],
    },
    gr: {
      all:    ["procurement", "gr"],
      list:   (params) => ["procurement", "gr", "list", params],
      detail: (id)     => ["procurement", "gr", id],
    },
    issue: {
      all:    ["procurement", "issue"],
      list:   (params) => ["procurement", "issue", "list", params],
      detail: (id)     => ["procurement", "issue", id],
    },
  },

  // ── Tools ─────────────────────────────────────────────────────────────────
  tools: {
    all:    ["tools"],
    list:   (params) => ["tools", "list", params],
    detail: (id)     => ["tools", id],
    borrowRecords: (params) => ["tools", "borrow-records", params],
    categories: {
      all:  ["tools", "categories"],
      list: (params) => ["tools", "categories", "list", params],
    },
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  dashboard: {
    overview:       ["dashboard", "overview"],
    inventoryValue: ["dashboard", "inventory-value"],
    topIssued:      (params) => ["dashboard", "top-issued", params],
    supplierStats:  ["dashboard", "supplier-stats"],
    stockMovement:  (params) => ["dashboard", "stock-movement", params],
    toolUtil:       ["dashboard", "tool-utilization"],
  },

  // ── Audit ─────────────────────────────────────────────────────────────────
  audit: {
    all:     ["audit"],
    list:    (params)             => ["audit", "list", params],
    stats:   (params)             => ["audit", "stats", params],
    history: (entity, entityId)   => ["audit", "history", entity, entityId],
  },
};
