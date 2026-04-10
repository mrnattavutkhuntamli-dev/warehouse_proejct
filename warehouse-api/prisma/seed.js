/**
 * Seed Script — ข้อมูลจำลองครบทุก model
 * รัน: node prisma/seed.js
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ── HELPERS ────────────────────────────────────────────────────────────────────

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randDec = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));
const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const pad = (n, len = 3) => String(n).padStart(len, "0");

// ── CLEAR ALL TABLES (order matters for FK) ───────────────────────────────────

async function clearAll() {
  console.log("🗑  Clearing existing data...");
  await prisma.$executeRaw`TRUNCATE TABLE
    audit_logs,
    tool_borrow_records,
    tools,
    tool_categories,
    stock_count_items,
    stock_counts,
    stock_transactions,
    stock,
    material_issue_items,
    material_issues,
    goods_receipt_items,
    goods_receipts,
    purchase_order_items,
    purchase_orders,
    warehouse_locations,
    warehouses,
    materials,
    material_categories,
    suppliers,
    technicians,
    users,
    departments
  CASCADE`;
  console.log("✅ Cleared");
}

// ── SEED ───────────────────────────────────────────────────────────────────────

async function main() {
  await clearAll();

  // ── 1. DEPARTMENTS (8) ──────────────────────────────────────────────────────
  console.log("👥 Seeding departments...");
  const deptNames = [
    "วิศวกรรมการผลิต", "ฝ่ายซ่อมบำรุง", "ฝ่ายจัดซื้อ",
    "ฝ่ายคลังสินค้า", "ฝ่ายควบคุมคุณภาพ", "ฝ่ายไอที",
    "ฝ่ายบัญชี", "ฝ่ายทรัพยากรบุคคล",
  ];
  const departments = await Promise.all(
    deptNames.map((name) => prisma.department.create({ data: { name } }))
  );

  // ── 2. USERS (20) ───────────────────────────────────────────────────────────
  console.log("👤 Seeding users...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const userDefs = [
    { employeeCode: "EMP001", name: "สมชาย วงศ์ใหญ่",   email: "somchai@example.com",  role: "ADMIN",      dept: 0 },
    { employeeCode: "EMP002", name: "สมหญิง ดีงาม",     email: "somying@example.com",  role: "MANAGER",    dept: 2 },
    { employeeCode: "EMP003", name: "วิชัย มานะดี",     email: "wichai@example.com",   role: "MANAGER",    dept: 3 },
    { employeeCode: "EMP004", name: "นภา สวยงาม",       email: "napa@example.com",     role: "STAFF",      dept: 2 },
    { employeeCode: "EMP005", name: "ธนากร ขยันมาก",    email: "thanakorn@example.com",role: "STAFF",      dept: 3 },
    { employeeCode: "EMP006", name: "กนกวรรณ ใจดี",     email: "kanok@example.com",    role: "STAFF",      dept: 3 },
    { employeeCode: "EMP007", name: "ประเสริฐ ทำงานดี",  email: "prasert@example.com",  role: "TECHNICIAN", dept: 1 },
    { employeeCode: "EMP008", name: "สุนีย์ รักงาน",    email: "sunee@example.com",    role: "TECHNICIAN", dept: 1 },
    { employeeCode: "EMP009", name: "อำนาจ เก่งกาจ",    email: "amnat@example.com",    role: "TECHNICIAN", dept: 1 },
    { employeeCode: "EMP010", name: "ปิยะ มาดี",        email: "piya@example.com",     role: "TECHNICIAN", dept: 0 },
    { employeeCode: "EMP011", name: "รัตนา ทองคำ",      email: "ratana@example.com",   role: "STAFF",      dept: 4 },
    { employeeCode: "EMP012", name: "ชาญชัย วิทยา",     email: "chanchay@example.com", role: "STAFF",      dept: 2 },
    { employeeCode: "EMP013", name: "มาลี สุขสันต์",    email: "malee@example.com",    role: "MANAGER",    dept: 1 },
    { employeeCode: "EMP014", name: "บุญมี หาได้",      email: "boonmee@example.com",  role: "STAFF",      dept: 3 },
    { employeeCode: "EMP015", name: "ศิริ พร้อมใจ",     email: "siri@example.com",     role: "STAFF",      dept: 5 },
    { employeeCode: "EMP016", name: "ณัฐ เฉลิมพล",      email: "nat@example.com",      role: "STAFF",      dept: 2 },
    { employeeCode: "EMP017", name: "แอน สาวสวย",       email: "ann@example.com",      role: "STAFF",      dept: 6 },
    { employeeCode: "EMP018", name: "ทวี มั่นคง",       email: "tawee@example.com",    role: "TECHNICIAN", dept: 1 },
    { employeeCode: "EMP019", name: "จิตรา ฉลาดมาก",    email: "jittra@example.com",   role: "STAFF",      dept: 4 },
    { employeeCode: "EMP020", name: "วรวุฒิ สมาร์ท",    email: "worawut@example.com",  role: "ADMIN",      dept: 7 },
  ];

  const users = [];
  for (const u of userDefs) {
    const user = await prisma.user.create({
      data: {
        employeeCode: u.employeeCode,
        name: u.name,
        email: u.email,
        passwordHash,
        phone: `08${randInt(10000000, 99999999)}`,
        role: u.role,
        departmentId: departments[u.dept].id,
        ...(u.role === "TECHNICIAN" ? {
          technician: {
            create: {
              skillLevel: rand(["JUNIOR","MID","SENIOR","EXPERT"]),
              shift: rand(["MORNING","AFTERNOON","NIGHT"]),
              specialty: rand(["ไฟฟ้า","เครื่องกล","ไฮดรอลิก","นิวแมติก","PLC","เชื่อม"]),
            },
          },
        } : {}),
      },
    });
    users.push(user);
  }

  const adminUser = users[0];
  const managerUser = users[1];
  const staffUser = users[4];
  const techUsers = users.filter((u) => userDefs.find((d) => d.email === u.email)?.role === "TECHNICIAN");

  // ── 3. MATERIAL CATEGORIES (8) ──────────────────────────────────────────────
  console.log("📦 Seeding material categories...");
  const matCatNames = [
    "น้ำมันหล่อลื่น", "อะไหล่เครื่องจักร", "วัสดุไฟฟ้า",
    "อุปกรณ์นิวแมติก", "วัสดุสิ้นเปลือง", "อะไหล่ไฮดรอลิก",
    "อุปกรณ์ความปลอดภัย", "วัสดุก่อสร้าง",
  ];
  const matCategories = await Promise.all(
    matCatNames.map((name) => prisma.materialCategory.create({ data: { name } }))
  );

  // ── 4. MATERIALS (40) ───────────────────────────────────────────────────────
  console.log("🔩 Seeding materials...");
  const materialDefs = [
    // น้ำมันหล่อลื่น
    { code: "MTL001", name: "น้ำมันเกียร์ ISO 68",    unit: "ลิตร", cat: 0, min: 50 },
    { code: "MTL002", name: "น้ำมันไฮดรอลิก VG46",   unit: "ลิตร", cat: 0, min: 100 },
    { code: "MTL003", name: "จาระบี NLGI 2",          unit: "กก",   cat: 0, min: 20 },
    { code: "MTL004", name: "น้ำมันตัด Cutting Oil",  unit: "ลิตร", cat: 0, min: 30 },
    { code: "MTL005", name: "น้ำมันเครื่อง 15W40",   unit: "ลิตร", cat: 0, min: 40 },
    // อะไหล่เครื่องจักร
    { code: "MTL006", name: "แบริ่ง 6205-2RS",       unit: "ชิ้น", cat: 1, min: 10 },
    { code: "MTL007", name: "แบริ่ง 6208-2Z",        unit: "ชิ้น", cat: 1, min: 10 },
    { code: "MTL008", name: "โอริง ขนาด 50mm",       unit: "ชิ้น", cat: 1, min: 50 },
    { code: "MTL009", name: "ซีลน้ำมัน TC 35x55x10", unit: "ชิ้น", cat: 1, min: 20 },
    { code: "MTL010", name: "สายพาน V-Belt A-50",    unit: "เส้น", cat: 1, min: 5 },
    { code: "MTL011", name: "สายพาน V-Belt B-62",    unit: "เส้น", cat: 1, min: 5 },
    { code: "MTL012", name: "คัปปลิ้ง Jaw Coupler",  unit: "ชุด",  cat: 1, min: 3 },
    // วัสดุไฟฟ้า
    { code: "MTL013", name: "ฟิวส์ 10A",             unit: "ชิ้น", cat: 2, min: 30 },
    { code: "MTL014", name: "ฟิวส์ 20A",             unit: "ชิ้น", cat: 2, min: 20 },
    { code: "MTL015", name: "เบรกเกอร์ 3P 30A",      unit: "ตัว",  cat: 2, min: 5 },
    { code: "MTL016", name: "Contactor LC1-D09",      unit: "ตัว",  cat: 2, min: 5 },
    { code: "MTL017", name: "สายไฟ THW 2.5mm²",      unit: "เมตร", cat: 2, min: 100 },
    { code: "MTL018", name: "Terminal Block 10A",     unit: "ชิ้น", cat: 2, min: 50 },
    // อุปกรณ์นิวแมติก
    { code: "MTL019", name: "โซลินอยด์วาล์ว 5/2",   unit: "ตัว",  cat: 3, min: 3 },
    { code: "MTL020", name: "กระบอกลม Bore 50mm",    unit: "ตัว",  cat: 3, min: 3 },
    { code: "MTL021", name: "ตัวกรองลม Air Filter",  unit: "ตัว",  cat: 3, min: 5 },
    { code: "MTL022", name: "ข้อต่อลม 8mm Push-in",  unit: "ชิ้น", cat: 3, min: 50 },
    // วัสดุสิ้นเปลือง
    { code: "MTL023", name: "ถุงมือยาง L",           unit: "คู่",  cat: 4, min: 100 },
    { code: "MTL024", name: "ผ้าเช็ดมือ",            unit: "กก",   cat: 4, min: 20 },
    { code: "MTL025", name: "กระดาษทราย #80",        unit: "แผ่น", cat: 4, min: 50 },
    { code: "MTL026", name: "กระดาษทราย #120",       unit: "แผ่น", cat: 4, min: 50 },
    { code: "MTL027", name: "ใบมีดคัตเตอร์",         unit: "ชิ้น", cat: 4, min: 30 },
    { code: "MTL028", name: "เทปพันท่อ PTFE",        unit: "ม้วน", cat: 4, min: 20 },
    // อะไหล่ไฮดรอลิก
    { code: "MTL029", name: "วาล์วไฮดรอลิก Relief", unit: "ตัว",  cat: 5, min: 2 },
    { code: "MTL030", name: "ปั๊มไฮดรอลิก Gear",    unit: "ตัว",  cat: 5, min: 2 },
    { code: "MTL031", name: "ไส้กรองไฮดรอลิก",      unit: "ชิ้น", cat: 5, min: 5 },
    { code: "MTL032", name: "สายไฮดรอลิก 1/2\"",    unit: "เมตร", cat: 5, min: 10 },
    // อุปกรณ์ความปลอดภัย
    { code: "MTL033", name: "หมวกนิรภัย",           unit: "ใบ",   cat: 6, min: 20 },
    { code: "MTL034", name: "แว่นตานิรภัย",         unit: "อัน",  cat: 6, min: 30 },
    { code: "MTL035", name: "รองเท้าเซฟตี้ (38)",  unit: "คู่",  cat: 6, min: 5 },
    { code: "MTL036", name: "หูฟังกันเสียง",        unit: "อัน",  cat: 6, min: 15 },
    // วัสดุก่อสร้าง
    { code: "MTL037", name: "สีทาพื้น Epoxy Gray",  unit: "ลิตร", cat: 7, min: 30 },
    { code: "MTL038", name: "น้ำยาล้างไขมัน",       unit: "ลิตร", cat: 7, min: 20 },
    { code: "MTL039", name: "สกรู M8x20",           unit: "ชิ้น", cat: 7, min: 200 },
    { code: "MTL040", name: "แผ่นยางปะเก็น 3mm",    unit: "แผ่น", cat: 7, min: 10 },
  ];

  const materials = await Promise.all(
    materialDefs.map((m) =>
      prisma.material.create({
        data: {
          code: m.code, name: m.name, unit: m.unit, minStock: m.min,
          categoryId: matCategories[m.cat].id,
          description: `${m.name} - สำหรับงานซ่อมบำรุงและผลิต`,
        },
      })
    )
  );

  // ── 5. SUPPLIERS (10) ───────────────────────────────────────────────────────
  console.log("🏭 Seeding suppliers...");
  const supplierDefs = [
    { code: "SUP001", name: "บริษัท ออยล์เทค จำกัด",       contact: "คุณสมพร",  phone: "02-111-1111", email: "sales@oiltech.co.th" },
    { code: "SUP002", name: "ห้างหุ้นส่วน แบริ่งไทย",      contact: "คุณวิทยา", phone: "02-222-2222", email: "info@bearingthai.com" },
    { code: "SUP003", name: "บริษัท อีเล็คโทรซัพพลาย จำกัด",contact: "คุณมาลี",  phone: "02-333-3333", email: "order@electrosupply.th" },
    { code: "SUP004", name: "บริษัท นิวโปร อินดัสเทรียล",   contact: "คุณชาญ",  phone: "02-444-4444", email: "sales@newpro.co.th" },
    { code: "SUP005", name: "บริษัท ไทยซีล เทคโนโลยี",      contact: "คุณบุญ",   phone: "02-555-5555", email: "info@thaiseal.com" },
    { code: "SUP006", name: "บริษัท ไฮดรอลิคไทย จำกัด",    contact: "คุณสุรีย์", phone: "02-666-6666", email: "sales@hydraulicthai.com" },
    { code: "SUP007", name: "ร้าน เซฟตี้ ช้อป",            contact: "คุณกมล",  phone: "02-777-7777", email: "order@safetyshop.th" },
    { code: "SUP008", name: "บริษัท เพาเวอร์ทูล จำกัด",    contact: "คุณนิรันดร์",phone: "02-888-8888",email: "info@powertool.co.th" },
    { code: "SUP009", name: "บริษัท เอเชีย เคมิคัล",       contact: "คุณปราณี", phone: "02-999-9999", email: "sales@asiachem.co.th" },
    { code: "SUP010", name: "บริษัท เมตตา อินดัสเทรียล",   contact: "คุณเมตตา", phone: "02-100-1000", email: "order@metta.co.th" },
  ];

  const suppliers = await Promise.all(
    supplierDefs.map((s) =>
      prisma.supplier.create({
        data: { ...s, address: `${randInt(1,999)} ถนนอุตสาหกรรม นิคมอุตสาหกรรม จ.สมุทรปราการ` },
      })
    )
  );

  // ── 6. WAREHOUSES + LOCATIONS (3 WH / 15 Locations) ────────────────────────
  console.log("🏗  Seeding warehouses & locations...");
  const warehouses = await Promise.all([
    prisma.warehouse.create({ data: { code: "WH01", name: "คลังหลัก อาคาร A", type: "MAIN" } }),
    prisma.warehouse.create({ data: { code: "WH02", name: "คลังย่อย ซ่อมบำรุง", type: "SUB" } }),
    prisma.warehouse.create({ data: { code: "WH03", name: "คลังกลางแจ้ง", type: "OUTDOOR" } }),
  ]);

  const locationDefs = [
    // WH01 — 7 ชั้นวาง
    { code: "A-01-01", desc: "ชั้น A แถว 1 ช่อง 1",  wh: 0 },
    { code: "A-01-02", desc: "ชั้น A แถว 1 ช่อง 2",  wh: 0 },
    { code: "A-02-01", desc: "ชั้น A แถว 2 ช่อง 1",  wh: 0 },
    { code: "A-02-02", desc: "ชั้น A แถว 2 ช่อง 2",  wh: 0 },
    { code: "B-01-01", desc: "ชั้น B แถว 1 ช่อง 1",  wh: 0 },
    { code: "B-01-02", desc: "ชั้น B แถว 1 ช่อง 2",  wh: 0 },
    { code: "B-02-01", desc: "ชั้น B แถว 2 ช่อง 1",  wh: 0 },
    // WH02 — 5 ชั้นวาง
    { code: "M-01-01", desc: "ซ่อมบำรุง ชั้น 1 ช่อง 1", wh: 1 },
    { code: "M-01-02", desc: "ซ่อมบำรุง ชั้น 1 ช่อง 2", wh: 1 },
    { code: "M-02-01", desc: "ซ่อมบำรุง ชั้น 2 ช่อง 1", wh: 1 },
    { code: "M-02-02", desc: "ซ่อมบำรุง ชั้น 2 ช่อง 2", wh: 1 },
    { code: "M-03-01", desc: "ซ่อมบำรุง ชั้น 3 ช่อง 1", wh: 1 },
    // WH03 — 3 โซน
    { code: "OUT-Z1",  desc: "โซน 1 กลางแจ้ง A",      wh: 2 },
    { code: "OUT-Z2",  desc: "โซน 2 กลางแจ้ง B",      wh: 2 },
    { code: "OUT-Z3",  desc: "โซน 3 กลางแจ้ง C",      wh: 2 },
  ];

  const locations = await Promise.all(
    locationDefs.map((l) =>
      prisma.warehouseLocation.create({
        data: { code: l.code, description: l.desc, warehouseId: warehouses[l.wh].id },
      })
    )
  );

  // ── 7. STOCK (seed initial stock for all 40 materials) ──────────────────────
  console.log("📊 Seeding initial stock...");
  for (const mat of materials) {
    const loc = rand(locations.slice(0, 12)); // WH01 + WH02 เท่านั้น
    const qty = randDec(Number(mat.minStock) * 0.5, Number(mat.minStock) * 3);
    await prisma.stock.create({
      data: { materialId: mat.id, locationId: loc.id, quantity: qty },
    });
    // บางตัวมี stock หลาย location
    if (Math.random() > 0.6) {
      const loc2 = rand(locations.slice(0, 7));
      if (loc2.id !== loc.id) {
        await prisma.stock.upsert({
          where: { materialId_locationId: { materialId: mat.id, locationId: loc2.id } },
          update: { quantity: { increment: randDec(10, 50) } },
          create: { materialId: mat.id, locationId: loc2.id, quantity: randDec(10, 50) },
        });
      }
    }
  }

  // ── 8. PURCHASE ORDERS (15 POs, หลาย status) ────────────────────────────────
  console.log("🛒 Seeding purchase orders...");
  const pos = [];
  const poStatuses = ["DRAFT","DRAFT","APPROVED","APPROVED","RECEIVED","RECEIVED","RECEIVED","PARTIAL_RECEIVED","CANCELLED"];

  for (let i = 1; i <= 15; i++) {
    const status = rand(poStatuses);
    const supplier = rand(suppliers);
    const createdDays = randInt(5, 90);
    const itemCount = randInt(2, 5);
    const selectedMaterials = [...materials].sort(() => 0.5 - Math.random()).slice(0, itemCount);

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber: `PO-2024-${pad(i)}`,
        supplierId: supplier.id,
        status,
        note: rand([null, null, "สั่งด่วน", "ราคาพิเศษ", "ส่งของภายใน 7 วัน"]),
        createdBy: rand([adminUser.id, managerUser.id, users[3].id]),
        createdAt: daysAgo(createdDays),
        updatedAt: daysAgo(createdDays - 1),
        ...(["APPROVED","RECEIVED","PARTIAL_RECEIVED"].includes(status)
          ? { approvedBy: managerUser.id, approvedAt: daysAgo(createdDays - 1) }
          : {}),
        items: {
          create: selectedMaterials.map((m) => ({
            materialId: m.id,
            quantity: randDec(10, 100),
            unitPrice: randDec(50, 2000),
            receivedQty: status === "RECEIVED" ? randDec(10, 100) :
                         status === "PARTIAL_RECEIVED" ? randDec(1, 9) : 0,
          })),
        },
      },
    });
    pos.push(po);
  }

  // ── 9. GOODS RECEIPTS (12) ───────────────────────────────────────────────────
  console.log("📥 Seeding goods receipts...");
  const approvedPOs = pos.filter((p) => ["APPROVED","RECEIVED","PARTIAL_RECEIVED"].includes(p.status));

  for (let i = 1; i <= 12; i++) {
    const po = rand(approvedPOs);
    const supplier = suppliers.find((_) => _.id === po.supplierId) || rand(suppliers);
    const poItems = await prisma.purchaseOrderItem.findMany({ where: { purchaseOrderId: po.id } });
    const loc = rand(locations.slice(0, 7));

    await prisma.goodsReceipt.create({
      data: {
        receiptNo: `GR-2024-${pad(i)}`,
        supplierId: supplier.id,
        poId: po.id,
        receivedBy: rand([users[4].id, users[5].id, users[13].id]),
        note: rand([null, null, "รับของครบตาม PO", "รับบางส่วน", "สินค้าดี"]),
        receivedAt: daysAgo(randInt(1, 60)),
        items: {
          create: poItems.slice(0, randInt(1, poItems.length)).map((item) => ({
            materialId: item.materialId,
            locationId: loc.id,
            quantity: randDec(5, Number(item.quantity)),
            unitPrice: item.unitPrice,
          })),
        },
      },
    });
  }

  // ── 10. MATERIAL ISSUES (20) ─────────────────────────────────────────────────
  console.log("📤 Seeding material issues...");
  const issueStatuses = ["DRAFT","DRAFT","APPROVED","ISSUED","ISSUED","ISSUED","CANCELLED"];

  for (let i = 1; i <= 20; i++) {
    const status = rand(issueStatuses);
    const itemCount = randInt(1, 4);
    const selectedMaterials = [...materials].sort(() => 0.5 - Math.random()).slice(0, itemCount);
    const requester = rand(users.slice(3, 15));
    const stocks = await prisma.stock.findMany({
      where: { materialId: { in: selectedMaterials.map((m) => m.id) }, quantity: { gt: 0 } },
    });
    if (stocks.length === 0) continue;

    await prisma.materialIssue.create({
      data: {
        issueNo: `MI-2024-${pad(i)}`,
        requestedBy: requester.id,
        purpose: rand([
          "งานซ่อมบำรุงเครื่องจักรสาย A",
          "งานซ่อมบำรุงระบบไฟฟ้า",
          "งานซ่อมบำรุงเชิงป้องกัน PM",
          "งานซ่อมฉุกเฉิน",
          "งานปรับปรุงสายการผลิต",
          "ทดสอบสินค้าใหม่",
        ]),
        status,
        createdAt: daysAgo(randInt(1, 60)),
        updatedAt: daysAgo(randInt(0, 2)),
        ...(["APPROVED","ISSUED"].includes(status)
          ? { approvedBy: rand([managerUser.id, users[12].id]) }
          : {}),
        items: {
          create: stocks.slice(0, randInt(1, Math.min(3, stocks.length))).map((s) => ({
            materialId: s.materialId,
            locationId: s.locationId,
            quantity: randDec(1, Math.min(Number(s.quantity) * 0.3, 20)),
          })),
        },
      },
    });
  }

  // ── 11. STOCK TRANSACTIONS (30) ──────────────────────────────────────────────
  console.log("📈 Seeding stock transactions...");
  const txTypes = ["IN","IN","IN","OUT","OUT","ADJUST","RETURN"];

  for (let i = 0; i < 30; i++) {
    const mat = rand(materials);
    const loc = rand(locations.slice(0, 12));
    const type = rand(txTypes);
    await prisma.stockTransaction.create({
      data: {
        materialId: mat.id,
        locationId: loc.id,
        type,
        quantity: randDec(1, 50),
        note: rand([null, "รับเพิ่มเติม", "เบิกใช้งาน", "ปรับยอด", "คืนของ"]),
        createdBy: rand(users.slice(0, 10)).id,
        createdAt: daysAgo(randInt(0, 90)),
      },
    });
  }

  // ── 12. STOCK COUNTS (5) ─────────────────────────────────────────────────────
  console.log("🔢 Seeding stock counts...");
  const countStatuses = ["COMPLETED","COMPLETED","COUNTING","DRAFT","COMPLETED"];

  for (let i = 1; i <= 5; i++) {
    const wh = rand(warehouses);
    const status = countStatuses[i - 1];
    const whLocations = locations.filter((l) => l.warehouseId === wh.id);
    const randomMaterials = [...materials].sort(() => 0.5 - Math.random()).slice(0, randInt(5, 12));
    const loc = rand(whLocations.length > 0 ? whLocations : locations);

    await prisma.stockCount.create({
      data: {
        countNo: `SC-2024-${pad(i)}`,
        warehouseId: wh.id,
        countedBy: rand(users.slice(3, 10)).id,
        note: rand([null, "นับประจำเดือน", "นับกลางปี", "นับปลายปี"]),
        status,
        createdAt: daysAgo(randInt(5, 90)),
        completedAt: status === "COMPLETED" ? daysAgo(randInt(1, 5)) : null,
        items: {
          create: randomMaterials.map((m) => {
            const sys = randDec(10, 200);
            const diff = randDec(-10, 10);
            return {
              materialId: m.id,
              locationId: loc.id,
              systemQty: sys,
              countedQty: parseFloat((sys + diff).toFixed(2)),
              note: Math.abs(diff) > 5 ? "ยอดผิดพลาด ต้องตรวจสอบ" : null,
            };
          }),
        },
      },
    });
  }

  // ── 13. TOOL CATEGORIES (6) ──────────────────────────────────────────────────
  console.log("🔧 Seeding tool categories...");
  const toolCatNames = [
    "เครื่องมือไฟฟ้า", "เครื่องมือมือ", "เครื่องมือวัด",
    "อุปกรณ์ยก", "เครื่องมือตัด", "อุปกรณ์ทดสอบ",
  ];
  const toolCategories = await Promise.all(
    toolCatNames.map((name) => prisma.toolCategory.create({ data: { name } }))
  );

  // ── 14. TOOLS (25) ───────────────────────────────────────────────────────────
  console.log("🛠  Seeding tools...");
  const toolDefs = [
    { code: "T001", name: "สว่านไฟฟ้า Bosch 13mm",         sn: "BSH-2023-001", cat: 0 },
    { code: "T002", name: "สว่านไฟฟ้า Makita 10mm",        sn: "MKT-2023-002", cat: 0 },
    { code: "T003", name: "เครื่องเจียร 4\" Hitachi",      sn: "HIT-2022-003", cat: 0 },
    { code: "T004", name: "เครื่องเจียร 7\" Bosch",        sn: "BSH-2022-004", cat: 0 },
    { code: "T005", name: "ประแจวัดแรงบิด 100Nm",          sn: "TRQ-2023-005", cat: 1 },
    { code: "T006", name: "ประแจปากตาย ชุด 8 ตัว",         sn: "WRN-2021-006", cat: 1 },
    { code: "T007", name: "ประแจเลื่อน 12\"",              sn: "ADJ-2022-007", cat: 1 },
    { code: "T008", name: "ไขควงชุด Phillips/Flat",        sn: "SCR-2023-008", cat: 1 },
    { code: "T009", name: "คีมปากจระเข้ 10\"",            sn: "PLR-2022-009", cat: 1 },
    { code: "T010", name: "ไมโครมิเตอร์ 0-25mm",          sn: "MCM-2023-010", cat: 2 },
    { code: "T011", name: "เวอร์เนียร์คาลิปเปอร์ 150mm",  sn: "VRN-2023-011", cat: 2 },
    { code: "T012", name: "Dial Gauge 0.001mm",            sn: "DLG-2022-012", cat: 2 },
    { code: "T013", name: "มัลติมิเตอร์ Fluke 117",       sn: "FLK-2023-013", cat: 2 },
    { code: "T014", name: "คลิปแอมป์ Fluke 323",          sn: "FLK-2022-014", cat: 2 },
    { code: "T015", name: "รอกโซ่ 1 ตัน",                 sn: "CHN-2020-015", cat: 3 },
    { code: "T016", name: "แม่แรงไฮดรอลิก 10 ตัน",        sn: "JCK-2021-016", cat: 3 },
    { code: "T017", name: "อุปกรณ์ดึงแบริ่ง Puller 3-jaw",sn: "PUL-2023-017", cat: 3 },
    { code: "T018", name: "เลื่อยฉลุ Jigsaw Bosch",       sn: "BSH-2023-018", cat: 4 },
    { code: "T019", name: "เลื่อยวงเดือน 7\" Makita",     sn: "MKT-2022-019", cat: 4 },
    { code: "T020", name: "ใบเลื่อยเหล็ก HSS 300mm",      sn: null,           cat: 4 },
    { code: "T021", name: "เครื่องทดสอบฉนวน Megger",      sn: "MGR-2022-021", cat: 5 },
    { code: "T022", name: "เครื่องวัดอุณหภูมิ Infrared",  sn: "INF-2023-022", cat: 5 },
    { code: "T023", name: "เครื่องวิเคราะห์การสั่นสะเทือน",sn: "VIB-2021-023", cat: 5 },
    { code: "T024", name: "ออสซิลโลสโคป 2CH 100MHz",      sn: "OSC-2022-024", cat: 5 },
    { code: "T025", name: "ชุดอุปกรณ์งานท่อ Pipe Kit",    sn: "PPK-2021-025", cat: 1 },
  ];

  const toolStatuses = ["AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","BORROWED","MAINTENANCE","BROKEN"];
  const toolConditions = ["GOOD","GOOD","GOOD","FAIR","FAIR","POOR"];

  const tools = await Promise.all(
    toolDefs.map((t, idx) =>
      prisma.tool.create({
        data: {
          code: t.code,
          name: t.name,
          serialNumber: t.sn,
          categoryId: toolCategories[t.cat].id,
          locationId: rand(locations.slice(7, 12)).id,
          status: rand(toolStatuses),
          condition: rand(toolConditions),
          description: `${t.name} — สำหรับงานซ่อมบำรุงและผลิต`,
        },
      })
    )
  );

  // ── 15. TOOL BORROW RECORDS (15) ─────────────────────────────────────────────
  console.log("📋 Seeding tool borrow records...");
  const borrowableTools = tools.filter((t) => t.status === "BORROWED" || t.status === "AVAILABLE");

  for (let i = 0; i < 15; i++) {
    const tool = rand(borrowableTools);
    const borrower = rand(techUsers.length > 0 ? techUsers : users.slice(6, 10));
    const borrowedDays = randInt(1, 30);
    const returned = Math.random() > 0.4;

    await prisma.toolBorrowRecord.create({
      data: {
        toolId: tool.id,
        borrowedBy: borrower.id,
        borrowedAt: daysAgo(borrowedDays),
        dueAt: daysAgo(borrowedDays - 7),
        purpose: rand([
          "งานซ่อมมอเตอร์ปั๊มน้ำ",
          "ตรวจสอบระบบไฟฟ้าแผงหลัก",
          "ซ่อมกระบอกลม",
          "ตรวจวัดการสั่นสะเทือนเครื่อง",
          "งาน PM ประจำเดือน",
          "ติดตั้งสายพาน",
        ]),
        conditionOnBorrow: rand(["GOOD","GOOD","FAIR"]),
        ...(returned ? {
          returnedBy: rand([borrower.id, adminUser.id]),
          returnedAt: daysAgo(randInt(0, borrowedDays - 1)),
          conditionOnReturn: rand(["GOOD","FAIR","POOR"]),
          note: rand([null, "คืนสภาพดี", "มีรอยขีดข่วน", "ต้องเช็คซ่อม"]),
        } : {}),
      },
    });
  }

  // ── 16. AUDIT LOGS (30) ──────────────────────────────────────────────────────
  console.log("📝 Seeding audit logs...");
  const auditActions = ["CREATE","UPDATE","APPROVE","CANCEL","ISSUE","BORROW","RETURN","ADJUST"];
  const auditEntities = ["PurchaseOrder","MaterialIssue","GoodsReceipt","Stock","Tool","User"];

  for (let i = 0; i < 30; i++) {
    const action = rand(auditActions);
    const entity = rand(auditEntities);
    const user = rand(users.slice(0, 10));
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action,
        entity,
        entityId: `00000000-0000-0000-0000-${pad(i + 1, 12)}`,
        oldValues: action !== "CREATE" ? { status: "DRAFT", quantity: 100 } : undefined,
        newValues: { status: action === "APPROVE" ? "APPROVED" : "ISSUED", quantity: 80 },
        diff: action !== "CREATE" ? { status: { before: "DRAFT", after: "APPROVED" } } : undefined,
        ipAddress: `192.168.1.${randInt(1, 254)}`,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        note: rand([null, null, `${action} โดย ${user.name}`, "ระบบอัตโนมัติ"]),
        createdAt: daysAgo(randInt(0, 30)),
      },
    });
  }

  // ── SUMMARY ───────────────────────────────────────────────────────────────────
  console.log("\n✅ =========================================");
  console.log("   SEED COMPLETED SUCCESSFULLY");
  console.log("===========================================");

  const counts = await Promise.all([
    prisma.department.count(),
    prisma.user.count(),
    prisma.materialCategory.count(),
    prisma.material.count(),
    prisma.supplier.count(),
    prisma.warehouse.count(),
    prisma.warehouseLocation.count(),
    prisma.stock.count(),
    prisma.stockTransaction.count(),
    prisma.purchaseOrder.count(),
    prisma.goodsReceipt.count(),
    prisma.materialIssue.count(),
    prisma.stockCount.count(),
    prisma.toolCategory.count(),
    prisma.tool.count(),
    prisma.toolBorrowRecord.count(),
    prisma.auditLog.count(),
  ]);

  const labels = [
    "Departments","Users","MaterialCategories","Materials","Suppliers",
    "Warehouses","Locations","Stocks","StockTransactions","PurchaseOrders",
    "GoodsReceipts","MaterialIssues","StockCounts","ToolCategories",
    "Tools","BorrowRecords","AuditLogs",
  ];

  labels.forEach((l, i) => console.log(`   ${l.padEnd(22)} ${counts[i]} records`));
  console.log("===========================================");
  console.log("\n🔑 Admin Login:");
  console.log("   Email   : somchai@example.com");
  console.log("   Password: password123\n");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
