import prisma from "../../config/prisma.js";

// ── OVERVIEW SUMMARY ──────────────────────────────────────────────────────────

export const getOverview = async () => {
  const [
    totalMaterials,
    lowStockCount,
    totalSuppliers,
    totalWarehouses,
    pendingPOs,
    pendingIssues,
    availableTools,
    borrowedTools,
  ] = await prisma.$transaction([
    prisma.material.count({ where: { isActive: true } }),
    // low stock: materials where sum(stock) < minStock
    prisma.$queryRaw`
      SELECT COUNT(*)::int AS count
      FROM materials m
      WHERE m.is_active = true
        AND m.min_stock IS NOT NULL
        AND (
          SELECT COALESCE(SUM(s.quantity), 0)
          FROM stock s WHERE s.material_id = m.id
        ) < m.min_stock
    `,
    prisma.supplier.count({ where: { isActive: true } }),
    prisma.warehouse.count({ where: { isActive: true } }),
    prisma.purchaseOrder.count({ where: { status: { in: ["DRAFT", "APPROVED"] } } }),
    prisma.materialIssue.count({ where: { status: { in: ["DRAFT", "APPROVED"] } } }),
    prisma.tool.count({ where: { status: "AVAILABLE", isActive: true } }),
    prisma.tool.count({ where: { status: "BORROWED", isActive: true } }),
  ]);

  return {
    materials: {
      total: totalMaterials,
      lowStock: lowStockCount[0]?.count ?? 0,
    },
    suppliers: { total: totalSuppliers },
    warehouses: { total: totalWarehouses },
    procurement: {
      pendingPurchaseOrders: pendingPOs,
      pendingMaterialIssues: pendingIssues,
    },
    tools: {
      available: availableTools,
      borrowed: borrowedTools,
    },
  };
};

// ── INVENTORY VALUE ───────────────────────────────────────────────────────────

export const getInventoryValue = async () => {
  // คำนวณมูลค่าคงคลัง = sum(quantity * unitPrice จาก goods receipt ล่าสุด)
  const result = await prisma.$queryRaw`
    SELECT
      m.id,
      m.code,
      m.name,
      m.unit,
      c.name AS category_name,
      COALESCE(SUM(s.quantity), 0)::float AS total_quantity,
      COALESCE(
        (
          SELECT gri.unit_price
          FROM goods_receipt_items gri
          JOIN goods_receipts gr ON gr.id = gri.receipt_id
          WHERE gri.material_id = m.id
          ORDER BY gr.received_at DESC
          LIMIT 1
        ), 0
      )::float AS last_unit_price,
      COALESCE(SUM(s.quantity), 0)::float *
      COALESCE(
        (
          SELECT gri.unit_price
          FROM goods_receipt_items gri
          JOIN goods_receipts gr ON gr.id = gri.receipt_id
          WHERE gri.material_id = m.id
          ORDER BY gr.received_at DESC
          LIMIT 1
        ), 0
      )::float AS total_value
    FROM materials m
    LEFT JOIN material_categories c ON c.id = m.category_id
    LEFT JOIN stock s ON s.material_id = m.id
    WHERE m.is_active = true
    GROUP BY m.id, m.code, m.name, m.unit, c.name
    ORDER BY total_value DESC
  `;

  const totalValue = result.reduce((sum, row) => sum + Number(row.total_value), 0);

  return {
    totalInventoryValue: totalValue,
    breakdown: result.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      unit: row.unit,
      category: row.category_name,
      totalQuantity: Number(row.total_quantity),
      lastUnitPrice: Number(row.last_unit_price),
      totalValue: Number(row.total_value),
    })),
  };
};

// ── TOP 5 MOST ISSUED MATERIALS ───────────────────────────────────────────────

export const getTopIssuedMaterials = async (limit = 5, days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const result = await prisma.$queryRaw`
    SELECT
      m.id,
      m.code,
      m.name,
      m.unit,
      c.name AS category_name,
      COUNT(DISTINCT mi.id)::int AS issue_count,
      COALESCE(SUM(mii.quantity), 0)::float AS total_issued_qty
    FROM material_issue_items mii
    JOIN materials m ON m.id = mii.material_id
    JOIN material_categories c ON c.id = m.category_id
    JOIN material_issues mi ON mi.id = mii.issue_id
    WHERE mi.status = 'ISSUED'
      AND mi.created_at >= ${since}
    GROUP BY m.id, m.code, m.name, m.unit, c.name
    ORDER BY total_issued_qty DESC
    LIMIT ${limit}
  `;

  return {
    period: `Last ${days} days`,
    since: since.toISOString(),
    items: result.map((row, index) => ({
      rank: index + 1,
      id: row.id,
      code: row.code,
      name: row.name,
      unit: row.unit,
      category: row.category_name,
      issueCount: Number(row.issue_count),
      totalIssuedQty: Number(row.total_issued_qty),
    })),
  };
};

// ── SUPPLIER PERFORMANCE ──────────────────────────────────────────────────────

export const getSupplierStats = async () => {
  // สถิติแต่ละ supplier: จำนวน PO, มูลค่ารวม, อัตรา on-time delivery
  const result = await prisma.$queryRaw`
    SELECT
      s.id,
      s.code,
      s.name,
      COUNT(DISTINCT po.id)::int AS total_pos,
      COUNT(DISTINCT CASE WHEN po.status IN ('RECEIVED','PARTIAL_RECEIVED') THEN po.id END)::int AS received_pos,
      COUNT(DISTINCT CASE WHEN po.status = 'CANCELLED' THEN po.id END)::int AS cancelled_pos,
      COUNT(DISTINCT gr.id)::int AS total_receipts,
      COALESCE(SUM(gri.quantity * gri.unit_price), 0)::float AS total_purchase_value,
      MIN(po.created_at) AS first_order_date,
      MAX(po.created_at) AS last_order_date
    FROM suppliers s
    LEFT JOIN purchase_orders po ON po.supplier_id = s.id
    LEFT JOIN goods_receipts gr ON gr.supplier_id = s.id
    LEFT JOIN goods_receipt_items gri ON gri.receipt_id = gr.id
    WHERE s.is_active = true
    GROUP BY s.id, s.code, s.name
    ORDER BY total_purchase_value DESC
  `;

  return result.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    totalPOs: Number(row.total_pos),
    receivedPOs: Number(row.received_pos),
    cancelledPOs: Number(row.cancelled_pos),
    totalReceipts: Number(row.total_receipts),
    totalPurchaseValue: Number(row.total_purchase_value),
    fulfillmentRate:
      row.total_pos > 0
        ? Math.round((Number(row.received_pos) / Number(row.total_pos)) * 100)
        : 0,
    firstOrderDate: row.first_order_date,
    lastOrderDate: row.last_order_date,
  }));
};

// ── STOCK MOVEMENT TREND ──────────────────────────────────────────────────────

export const getStockMovementTrend = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const result = await prisma.$queryRaw`
    SELECT
      DATE(created_at) AS date,
      type,
      COUNT(*)::int AS transaction_count,
      COALESCE(SUM(quantity), 0)::float AS total_quantity
    FROM stock_transactions
    WHERE created_at >= ${since}
    GROUP BY DATE(created_at), type
    ORDER BY date ASC, type
  `;

  // Group by date
  const byDate = {};
  for (const row of result) {
    const d = row.date.toISOString().slice(0, 10);
    if (!byDate[d]) byDate[d] = { date: d, IN: 0, OUT: 0, TRANSFER: 0, ADJUST: 0, RETURN: 0 };
    byDate[d][row.type] = Number(row.total_quantity);
  }

  return {
    period: `Last ${days} days`,
    trend: Object.values(byDate),
  };
};

// ── TOOL UTILIZATION ──────────────────────────────────────────────────────────

export const getToolUtilization = async () => {
  const result = await prisma.$queryRaw`
    SELECT
      tc.id AS category_id,
      tc.name AS category_name,
      COUNT(t.id)::int AS total_tools,
      COUNT(CASE WHEN t.status = 'AVAILABLE' THEN 1 END)::int AS available,
      COUNT(CASE WHEN t.status = 'BORROWED' THEN 1 END)::int AS borrowed,
      COUNT(CASE WHEN t.status = 'MAINTENANCE' THEN 1 END)::int AS maintenance,
      COUNT(CASE WHEN t.status = 'BROKEN' THEN 1 END)::int AS broken,
      COUNT(CASE WHEN t.condition = 'POOR' THEN 1 END)::int AS poor_condition
    FROM tool_categories tc
    LEFT JOIN tools t ON t.category_id = tc.id AND t.is_active = true
    GROUP BY tc.id, tc.name
    ORDER BY total_tools DESC
  `;

  const overall = result.reduce(
    (acc, r) => ({
      total: acc.total + Number(r.total_tools),
      available: acc.available + Number(r.available),
      borrowed: acc.borrowed + Number(r.borrowed),
      maintenance: acc.maintenance + Number(r.maintenance),
      broken: acc.broken + Number(r.broken),
    }),
    { total: 0, available: 0, borrowed: 0, maintenance: 0, broken: 0 }
  );

  return {
    overall: {
      ...overall,
      utilizationRate:
        overall.total > 0 ? Math.round((overall.borrowed / overall.total) * 100) : 0,
    },
    byCategory: result.map((r) => ({
      categoryId: r.category_id,
      categoryName: r.category_name,
      total: Number(r.total_tools),
      available: Number(r.available),
      borrowed: Number(r.borrowed),
      maintenance: Number(r.maintenance),
      broken: Number(r.broken),
      poorCondition: Number(r.poor_condition),
      utilizationRate:
        r.total_tools > 0
          ? Math.round((Number(r.borrowed) / Number(r.total_tools)) * 100)
          : 0,
    })),
  };
};
