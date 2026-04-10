import prisma from "../../config/prisma.js";
import { AppError } from "../../middleware/errorMiddleware.js";
import { getPagination, buildPaginationMeta } from "../../utils/pagination.js";
import { generateCode } from "../../utils/generateCode.js";
import { deductStockWithLock, addStockWithLock, withLock, updateWithOptimisticLock } from "../../utils/concurrency.js";
import { log as auditLog } from "../audit/audit.service.js";

const poInclude = {
  supplier: true,
  creator: { select: { id: true, name: true } },
  items: { include: { material: { select: { id: true, code: true, name: true, unit: true } } } },
};

export const getAllPOs = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {};
  if (query.status) where.status = query.status;
  if (query.supplierId) where.supplierId = query.supplierId;
  const [data, total] = await prisma.$transaction([
    prisma.purchaseOrder.findMany({ where, skip, take: limit, include: poInclude, orderBy: { createdAt: "desc" } }),
    prisma.purchaseOrder.count({ where }),
  ]);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
};

export const getPOById = async (id) => {
  const po = await prisma.purchaseOrder.findUnique({ where: { id }, include: poInclude });
  if (!po) throw new AppError("Purchase order not found", 404);
  return po;
};

export const createPO = async (body, userId, auditMeta = {}) => {
  const poNumber = generateCode("PO");
  const po = await prisma.purchaseOrder.create({
    data: { poNumber, supplierId: body.supplierId, note: body.note, createdBy: userId, items: { create: body.items } },
    include: poInclude,
  });
  await auditLog({ userId, action: "CREATE", entity: "PurchaseOrder", entityId: po.id,
    newValues: { poNumber, supplierId: body.supplierId, itemCount: body.items.length }, ...auditMeta });
  return po;
};

export const updatePOStatus = async (id, { status, version }, userId, auditMeta = {}) => {
  const po = await prisma.purchaseOrder.findUnique({ where: { id } });
  if (!po) throw new AppError("Purchase order not found", 404);
  if (po.status !== "DRAFT") throw new AppError("Only DRAFT purchase orders can be updated", 400);

  let updated;
  if (version) {
    updated = await updateWithOptimisticLock("purchaseOrder", id, version, {
      status,
      ...(status === "APPROVED" ? { approvedBy: userId, approvedAt: new Date() } : {}),
    });
  } else {
    updated = await prisma.purchaseOrder.update({
      where: { id },
      data: { status, ...(status === "APPROVED" ? { approvedBy: userId, approvedAt: new Date() } : {}) },
    });
  }

  await auditLog({ userId, action: status === "APPROVED" ? "APPROVE" : "CANCEL",
    entity: "PurchaseOrder", entityId: id,
    oldValues: { status: po.status }, newValues: { status }, ...auditMeta });

  return prisma.purchaseOrder.findUnique({ where: { id }, include: poInclude });
};

export const getAllGRs = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {};
  if (query.supplierId) where.supplierId = query.supplierId;
  if (query.poId) where.poId = query.poId;
  const [data, total] = await prisma.$transaction([
    prisma.goodsReceipt.findMany({
      where, skip, take: limit,
      include: {
        supplier: true,
        receiver: { select: { id: true, name: true } },
        purchaseOrder: { select: { id: true, poNumber: true } },
        items: { include: { material: true, location: true } },
      },
      orderBy: { receivedAt: "desc" },
    }),
    prisma.goodsReceipt.count({ where }),
  ]);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
};

export const getGRById = async (id) => {
  const gr = await prisma.goodsReceipt.findUnique({
    where: { id },
    include: {
      supplier: true,
      receiver: { select: { id: true, name: true } },
      purchaseOrder: true,
      items: { include: { material: true, location: { include: { warehouse: true } } } },
    },
  });
  if (!gr) throw new AppError("Goods receipt not found", 404);
  return gr;
};

export const createGR = async (body, userId, auditMeta = {}) => {
  const receiptNo = generateCode("GR");
  return prisma.$transaction(async (tx) => {
    const gr = await tx.goodsReceipt.create({
      data: { receiptNo, supplierId: body.supplierId, poId: body.poId, receivedBy: userId,
              note: body.note, items: { create: body.items } },
      include: { items: true },
    });

    for (const item of body.items) {
      await addStockWithLock(item.materialId, item.locationId, item.quantity, userId, gr.id, `Goods receipt: ${receiptNo}`);
    }

    if (body.poId) {
      for (const item of body.items) {
        await tx.purchaseOrderItem.updateMany({
          where: { purchaseOrderId: body.poId, materialId: item.materialId },
          data: { receivedQty: { increment: item.quantity } },
        });
      }
      const poItems = await tx.purchaseOrderItem.findMany({ where: { purchaseOrderId: body.poId } });
      const allReceived = poItems.every((i) => Number(i.receivedQty) >= Number(i.quantity));
      await tx.purchaseOrder.update({ where: { id: body.poId },
        data: { status: allReceived ? "RECEIVED" : "PARTIAL_RECEIVED" } });
    }

    await auditLog({ userId, action: "CREATE", entity: "GoodsReceipt", entityId: gr.id,
      newValues: { receiptNo, supplierId: body.supplierId, itemCount: body.items.length }, ...auditMeta }, tx);

    return gr;
  });
};

export const getAllIssues = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {};
  if (query.status) where.status = query.status;
  if (query.requestedBy) where.requestedBy = query.requestedBy;
  const [data, total] = await prisma.$transaction([
    prisma.materialIssue.findMany({
      where, skip, take: limit,
      include: {
        requester: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } },
        items: { include: { material: { select: { id: true, code: true, name: true, unit: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.materialIssue.count({ where }),
  ]);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
};

export const getIssueById = async (id) => {
  const issue = await prisma.materialIssue.findUnique({
    where: { id },
    include: {
      requester: { select: { id: true, name: true } },
      approver: { select: { id: true, name: true } },
      items: { include: { material: true, location: { include: { warehouse: true } } } },
    },
  });
  if (!issue) throw new AppError("Material issue not found", 404);
  return issue;
};

export const createIssue = async (body, userId, auditMeta = {}) => {
  const issueNo = generateCode("MI");
  const issue = await prisma.materialIssue.create({
    data: { issueNo, requestedBy: userId, purpose: body.purpose, items: { create: body.items } },
    include: { requester: { select: { id: true, name: true } }, items: { include: { material: true, location: true } } },
  });
  await auditLog({ userId, action: "CREATE", entity: "MaterialIssue", entityId: issue.id,
    newValues: { issueNo, purpose: body.purpose, itemCount: body.items.length }, ...auditMeta });
  return issue;
};

export const updateIssueStatus = async (id, { status, version }, userId, auditMeta = {}) => {
  const issue = await prisma.materialIssue.findUnique({ where: { id }, include: { items: true } });
  if (!issue) throw new AppError("Material issue not found", 404);
  if (issue.status === "ISSUED" || issue.status === "CANCELLED")
    throw new AppError("Cannot update a finalized material issue", 400);

  return withLock(`material-issue:${id}`, async () => {
    if (version) {
      const current = await prisma.materialIssue.findUnique({ where: { id } });
      if (current.updatedAt.toISOString() !== version) {
        throw new AppError("This issue was modified by another user. Please refresh and try again.", 409);
      }
    }

    const oldStatus = issue.status;

    if (status === "ISSUED") {
      for (const item of issue.items) {
        await deductStockWithLock(
          item.materialId, item.locationId, Number(item.quantity),
          userId, id, `Material issue: ${issue.issueNo}`, auditMeta
        );
      }
    }

    const updated = await prisma.materialIssue.update({
      where: { id },
      data: { status, ...(status === "APPROVED" ? { approvedBy: userId } : {}) },
      include: { items: { include: { material: true, location: true } } },
    });

    await auditLog({
      userId,
      action: status === "APPROVED" ? "APPROVE" : status === "ISSUED" ? "ISSUE" : "CANCEL",
      entity: "MaterialIssue", entityId: id,
      oldValues: { status: oldStatus }, newValues: { status },
      note: `Issue: ${issue.issueNo}`, ...auditMeta,
    });

    return updated;
  });
};
