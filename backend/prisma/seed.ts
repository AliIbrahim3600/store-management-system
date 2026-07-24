import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database ...\n");

  // ── Cleanup in reverse dependency order ──────────────────────────────
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.overtimeRequest.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.cashRegister.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.store.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.brand.deleteMany();

  // ── Password hash ────────────────────────────────────────────────────
  const password = await bcrypt.hash("Admin@123", 12);

  // ── 1. Roles ─────────────────────────────────────────────────────────
  const devRole = await prisma.role.create({
    data: { name: "Developer", description: "Super-admin with full system access" },
  });
  const ownerRole = await prisma.role.create({
    data: { name: "Owner", description: "Brand owner — full access within brand" },
  });
  const adminRole = await prisma.role.create({
    data: { name: "Admin", description: "Store administrator" },
  });
  const empRole = await prisma.role.create({
    data: { name: "Employee", description: "Store employee" },
  });

  console.log("  ✓ Roles created");

  // ── 2. Permissions ──────────────────────────────────────────────────
  const perms = await Promise.all([
    prisma.permission.create({ data: { name: "product.create", description: "Create new products" } }),
    prisma.permission.create({ data: { name: "product.read", description: "View products" } }),
    prisma.permission.create({ data: { name: "product.update", description: "Edit products" } }),
    prisma.permission.create({ data: { name: "product.delete", description: "Delete products" } }),
    prisma.permission.create({ data: { name: "sale.create", description: "Create sales" } }),
    prisma.permission.create({ data: { name: "sale.read", description: "View sales" } }),
    prisma.permission.create({ data: { name: "sale.refund", description: "Issue refunds" } }),
    prisma.permission.create({ data: { name: "employee.create", description: "Hire employees" } }),
    prisma.permission.create({ data: { name: "employee.read", description: "View employees" } }),
    prisma.permission.create({ data: { name: "employee.update", description: "Update employee data" } }),
    prisma.permission.create({ data: { name: "inventory.read", description: "View inventory" } }),
    prisma.permission.create({ data: { name: "inventory.adjust", description: "Adjust stock levels" } }),
    prisma.permission.create({ data: { name: "purchase.create", description: "Create purchase orders" } }),
    prisma.permission.create({ data: { name: "purchase.read", description: "View purchase orders" } }),
    prisma.permission.create({ data: { name: "report.read", description: "View reports" } }),
    prisma.permission.create({ data: { name: "user.manage", description: "Manage system users" } }),
    prisma.permission.create({ data: { name: "role.manage", description: "Manage roles & permissions" } }),
    prisma.permission.create({ data: { name: "supplier.manage", description: "Manage suppliers" } }),
    prisma.permission.create({ data: { name: "customer.manage", description: "Manage customers" } }),
    prisma.permission.create({ data: { name: "audit.read", description: "View audit logs" } }),
  ]);

  console.log("  ✓ Permissions created");

  // ── 3. Role ↔ Permission assignments ─────────────────────────────────
  // Developer gets everything
  const allPermIds = perms.map((p:any) => ({ permissionId: p.id }));
  await prisma.rolePermission.createMany({
    data: allPermIds.map((p:any) => ({ roleId: devRole.id, ...p })),
  });
  // Owner gets everything
  await prisma.rolePermission.createMany({
    data: allPermIds.map((p:any) => ({ roleId: ownerRole.id, ...p })),
  });
  // Admin gets most except role.manage & user.manage
  const adminPerms = perms.filter(
    (p:any) => !["user.manage", "role.manage"].includes(p.name),
  );
  await prisma.rolePermission.createMany({
    data: adminPerms.map((p:any) => ({ roleId: adminRole.id, permissionId: p.id })),
  });
  // Employee gets read + basic ops
  const empPermNames = [
    "product.read", "sale.create", "sale.read", "inventory.read",
    "purchase.read", "customer.manage",
  ];
  const empPerms = perms.filter((p:any) => empPermNames.includes(p.name));
  await prisma.rolePermission.createMany({
    data: empPerms.map((p:any) => ({ roleId: empRole.id, permissionId: p.id })),
  });

  console.log("  ✓ Role-permission assignments created");

  // ── 4. Brand ─────────────────────────────────────────────────────────
  const brand = await prisma.brand.create({
    data: {
      name: "FreshMart Supermarkets",
      email: "info@freshmart.com",
      phone: "+1-555-0100",
      address: "100 Market Street, New York, NY 10001",
      taxNumber: "TAX-FM-2024-001",
      isActive: true,
    },
  });

  console.log("  ✓ Brand created");

  // ── 5. Store ─────────────────────────────────────────────────────────
  const store = await prisma.store.create({
    data: {
      brandId: brand.id,
      name: "FreshMart Downtown",
      code: "FM-NYC-001",
      address: "200 Broadway, New York, NY 10007",
      city: "New York",
      phone: "+1-555-0201",
      openingTime: "07:00",
      closingTime: "23:00",
      isActive: true,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      brandId: brand.id,
      name: "FreshMart Uptown",
      code: "FM-NYC-002",
      address: "500 Park Avenue, New York, NY 10022",
      city: "New York",
      phone: "+1-555-0202",
      openingTime: "08:00",
      closingTime: "22:00",
      isActive: true,
    },
  });

  console.log("  ✓ Stores created");

  // ── 6. Users ─────────────────────────────────────────────────────────
  const developer = await prisma.user.create({
    data: {
      email: "dev@freshmart.com",
      passwordHash: password,
      firstName: "System",
      lastName: "Admin",
      phone: "+1-555-1001",
      roleId: devRole.id,
      isActive: true,
    },
  });

  const owner = await prisma.user.create({
    data: {
      brandId: brand.id,
      email: "owner@freshmart.com",
      passwordHash: password,
      firstName: "John",
      lastName: "Smith",
      phone: "+1-555-1002",
      roleId: ownerRole.id,
      isActive: true,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      brandId: brand.id,
      email: "admin@freshmart.com",
      passwordHash: password,
      firstName: "Sarah",
      lastName: "Johnson",
      phone: "+1-555-1003",
      roleId: adminRole.id,
      isActive: true,
    },
  });

  const cashierUser = await prisma.user.create({
    data: {
      brandId: brand.id,
      email: "cashier1@freshmart.com",
      passwordHash: password,
      firstName: "Mike",
      lastName: "Brown",
      phone: "+1-555-1004",
      roleId: empRole.id,
      isActive: true,
    },
  });

  const cashierUser2 = await prisma.user.create({
    data: {
      brandId: brand.id,
      email: "cashier2@freshmart.com",
      passwordHash: password,
      firstName: "Lisa",
      lastName: "Davis",
      phone: "+1-555-1005",
      roleId: empRole.id,
      isActive: true,
    },
  });

  const stockKeeperUser = await prisma.user.create({
    data: {
      brandId: brand.id,
      email: "stock1@freshmart.com",
      passwordHash: password,
      firstName: "Tom",
      lastName: "Wilson",
      phone: "+1-555-1006",
      roleId: empRole.id,
      isActive: true,
    },
  });

  console.log("  ✓ Users created");

  // ── 7. Employees ─────────────────────────────────────────────────────
  const mgrEmployee = await prisma.employee.create({
    data: {
      storeId: store.id,
      userId: adminUser.id,
      employeeCode: "EMP-001",
      jobTitle: "STORE_MANAGER",
      salary: 65000.0,
      hireDate: new Date("2023-01-15"),
      isActive: true,
    },
  });

  const cashierEmployee = await prisma.employee.create({
    data: {
      storeId: store.id,
      userId: cashierUser.id,
      employeeCode: "EMP-002",
      jobTitle: "CASHIER",
      salary: 32000.0,
      hireDate: new Date("2023-03-01"),
      isActive: true,
    },
  });

  const cashierEmployee2 = await prisma.employee.create({
    data: {
      storeId: store.id,
      userId: cashierUser2.id,
      employeeCode: "EMP-003",
      jobTitle: "CASHIER",
      salary: 32000.0,
      hireDate: new Date("2023-06-20"),
      isActive: true,
    },
  });

  const stockEmployee = await prisma.employee.create({
    data: {
      storeId: store.id,
      userId: stockKeeperUser.id,
      employeeCode: "EMP-004",
      jobTitle: "STOCK_KEEPER",
      salary: 35000.0,
      hireDate: new Date("2023-04-10"),
      isActive: true,
    },
  });

  console.log("  ✓ Employees created");

  // ── 8. Cash Registers ────────────────────────────────────────────────
  const reg1 = await prisma.cashRegister.create({
    data: { storeId: store.id, name: "Register 1", number: "REG-001", isActive: true },
  });
  const reg2 = await prisma.cashRegister.create({
    data: { storeId: store.id, name: "Register 2", number: "REG-002", isActive: true },
  });
  const reg3 = await prisma.cashRegister.create({
    data: { storeId: store2.id, name: "Register 1", number: "REG-UP-001", isActive: true },
  });

  console.log("  ✓ Cash registers created");

  // ── 9. Categories ────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.create({ data: { brandId: brand.id, name: "Beverages" } }),
    prisma.category.create({ data: { brandId: brand.id, name: "Dairy & Eggs" } }),
    prisma.category.create({ data: { brandId: brand.id, name: "Bakery" } }),
    prisma.category.create({ data: { brandId: brand.id, name: "Meat & Poultry" } }),
    prisma.category.create({ data: { brandId: brand.id, name: "Fruits & Vegetables" } }),
    prisma.category.create({ data: { brandId: brand.id, name: "Snacks & Confectionery" } }),
    prisma.category.create({ data: { brandId: brand.id, name: "Household" } }),
    prisma.category.create({ data: { brandId: brand.id, name: "Personal Care" } }),
  ]);

  const [bevCat, dairyCat, bakeryCat, meatCat, produceCat, snackCat, houseCat, careCat] = categories;

  console.log("  ✓ Categories created");

  // ── 10. Suppliers ────────────────────────────────────────────────────
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: { brandId: brand.id, name: "Coca-Cola Distributors", email: "orders@coke.com", phone: "+1-800-555-0101" },
    }),
    prisma.supplier.create({
      data: { brandId: brand.id, name: "DairyPure Inc.", email: "sales@dairypure.com", phone: "+1-800-555-0102" },
    }),
    prisma.supplier.create({
      data: { brandId: brand.id, name: "Wonderful Bakery Co.", email: "bake@wonderfulbakery.com", phone: "+1-800-555-0103" },
    }),
    prisma.supplier.create({
      data: { brandId: brand.id, name: "Premium Meats Ltd.", email: "orders@premiummeats.com", phone: "+1-800-555-0104" },
    }),
    prisma.supplier.create({
      data: { brandId: brand.id, name: "Fresh Fields Produce", email: "produce@freshfields.com", phone: "+1-800-555-0105" },
    }),
    prisma.supplier.create({
      data: { brandId: brand.id, name: "SnackWorld Corp", email: "info@snackworld.com", phone: "+1-800-555-0106" },
    }),
  ]);

  const [supp1, supp2, supp3, supp4, supp5, supp6] = suppliers;

  console.log("  ✓ Suppliers created");

  // ── 11. Products ─────────────────────────────────────────────────────
  const products = await Promise.all([
    // Beverages
    prisma.product.create({
      data: { brandId: brand.id, categoryId: bevCat.id, barcode: "4901234567890", sku: "BEV-001", name: "Coca-Cola 355ml", costPrice: 0.85, sellingPrice: 1.50, taxRate: 8.0, isActive: true },
    }),
    prisma.product.create({
      data: { brandId: brand.id, categoryId: bevCat.id, barcode: "4901234567891", sku: "BEV-002", name: "Spring Water 500ml", costPrice: 0.30, sellingPrice: 0.99, taxRate: 8.0, isActive: true },
    }),
    prisma.product.create({
      data: { brandId: brand.id, categoryId: bevCat.id, barcode: "4901234567892", sku: "BEV-003", name: "Orange Juice 1L", costPrice: 1.80, sellingPrice: 3.49, taxRate: 8.0, isActive: true },
    }),
    // Dairy
    prisma.product.create({
      data: { brandId: brand.id, categoryId: dairyCat.id, barcode: "4901234567893", sku: "DRY-001", name: "Whole Milk 1L", costPrice: 1.10, sellingPrice: 2.29, taxRate: 8.0, isActive: true },
    }),
    prisma.product.create({
      data: { brandId: brand.id, categoryId: dairyCat.id, barcode: "4901234567894", sku: "DRY-002", name: "Large Eggs (12pk)", costPrice: 2.00, sellingPrice: 4.99, taxRate: 8.0, isActive: true },
    }),
    prisma.product.create({
      data: { brandId: brand.id, categoryId: dairyCat.id, barcode: "4901234567895", sku: "DRY-003", name: "Cheddar Cheese 200g", costPrice: 2.50, sellingPrice: 5.49, taxRate: 8.0, isActive: true },
    }),
    // Bakery
    prisma.product.create({
      data: { brandId: brand.id, categoryId: bakeryCat.id, barcode: "4901234567896", sku: "BAK-001", name: "White Bread Loaf", costPrice: 0.90, sellingPrice: 2.49, taxRate: 8.0, isActive: true },
    }),
    prisma.product.create({
      data: { brandId: brand.id, categoryId: bakeryCat.id, barcode: "4901234567897", sku: "BAK-002", name: "Chocolate Croissant", costPrice: 1.20, sellingPrice: 3.29, taxRate: 8.0, isActive: true },
    }),
    // Meat
    prisma.product.create({
      data: { brandId: brand.id, categoryId: meatCat.id, barcode: "4901234567898", sku: "MEA-001", name: "Chicken Breast 500g", costPrice: 3.50, sellingPrice: 7.99, taxRate: 8.0, isActive: true },
    }),
    prisma.product.create({
      data: { brandId: brand.id, categoryId: meatCat.id, barcode: "4901234567899", sku: "MEA-002", name: "Ground Beef 500g", costPrice: 4.00, sellingPrice: 8.49, taxRate: 8.0, isActive: true },
    }),
    // Produce
    prisma.product.create({
      data: { brandId: brand.id, categoryId: produceCat.id, barcode: "4901234567900", sku: "PRO-001", name: "Bananas (per lb)", costPrice: 0.40, sellingPrice: 0.69, taxRate: 0, isActive: true },
    }),
    prisma.product.create({
      data: { brandId: brand.id, categoryId: produceCat.id, barcode: "4901234567901", sku: "PRO-002", name: "Organic Avocado", costPrice: 0.80, sellingPrice: 1.99, taxRate: 0, isActive: true },
    }),
    // Snacks
    prisma.product.create({
      data: { brandId: brand.id, categoryId: snackCat.id, barcode: "4901234567902", sku: "SNK-001", name: "Potato Chips 150g", costPrice: 1.20, sellingPrice: 3.29, taxRate: 8.0, isActive: true },
    }),
    prisma.product.create({
      data: { brandId: brand.id, categoryId: snackCat.id, barcode: "4901234567903", sku: "SNK-002", name: "Milk Chocolate Bar", costPrice: 0.90, sellingPrice: 2.49, taxRate: 8.0, isActive: true },
    }),
    // Household
    prisma.product.create({
      data: { brandId: brand.id, categoryId: houseCat.id, barcode: "4901234567904", sku: "HSE-001", name: "Paper Towels (6 rolls)", costPrice: 3.00, sellingPrice: 6.99, taxRate: 8.0, isActive: true },
    }),
    prisma.product.create({
      data: { brandId: brand.id, categoryId: houseCat.id, barcode: "4901234567905", sku: "HSE-002", name: "Dish Soap 500ml", costPrice: 1.50, sellingPrice: 3.79, taxRate: 8.0, isActive: true },
    }),
    // Personal Care
    prisma.product.create({
      data: { brandId: brand.id, categoryId: careCat.id, barcode: "4901234567906", sku: "PCR-001", name: "Toothpaste 100ml", costPrice: 1.80, sellingPrice: 4.29, taxRate: 8.0, isActive: true },
    }),
    prisma.product.create({
      data: { brandId: brand.id, categoryId: careCat.id, barcode: "4901234567907", sku: "PCR-002", name: "Shampoo 400ml", costPrice: 2.50, sellingPrice: 5.99, taxRate: 8.0, isActive: true },
    }),
  ]);

  console.log(`  ✓ ${products.length} products created`);

  // ── 12. Customers ────────────────────────────────────────────────────
  const customers = await Promise.all([
    prisma.customer.create({ data: { brandId: brand.id, name: "Alice Williams", phone: "+1-555-2001", email: "alice@email.com", loyaltyPoints: 240 } }),
    prisma.customer.create({ data: { brandId: brand.id, name: "Bob Taylor", phone: "+1-555-2002", email: "bob@email.com", loyaltyPoints: 85 } }),
    prisma.customer.create({ data: { brandId: brand.id, name: "Carol Martinez", phone: "+1-555-2003", email: "carol@email.com", loyaltyPoints: 510 } }),
    prisma.customer.create({ data: { brandId: brand.id, name: "David Lee", phone: "+1-555-2004", loyaltyPoints: 0 } }),
    prisma.customer.create({ data: { brandId: brand.id, name: "Emily Garcia", phone: "+1-555-2005", email: "emily@email.com", loyaltyPoints: 130 } }),
  ]);

  console.log("  ✓ Customers created");

  // ── 13. Inventory ────────────────────────────────────────────────────
  const stockLevels = [
    { storeId: store.id, productId: products[0].id, quantity: 240, minQuantity: 50, maxQuantity: 500 },
    { storeId: store.id, productId: products[1].id, quantity: 500, minQuantity: 100, maxQuantity: 1000 },
    { storeId: store.id, productId: products[2].id, quantity: 80, minQuantity: 30, maxQuantity: 200 },
    { storeId: store.id, productId: products[3].id, quantity: 150, minQuantity: 40, maxQuantity: 300 },
    { storeId: store.id, productId: products[4].id, quantity: 60, minQuantity: 20, maxQuantity: 150 },
    { storeId: store.id, productId: products[5].id, quantity: 45, minQuantity: 15, maxQuantity: 100 },
    { storeId: store.id, productId: products[6].id, quantity: 200, minQuantity: 50, maxQuantity: 400 },
    { storeId: store.id, productId: products[7].id, quantity: 90, minQuantity: 25, maxQuantity: 200 },
    { storeId: store.id, productId: products[8].id, quantity: 70, minQuantity: 20, maxQuantity: 150 },
    { storeId: store.id, productId: products[9].id, quantity: 55, minQuantity: 15, maxQuantity: 120 },
    { storeId: store.id, productId: products[10].id, quantity: 300, minQuantity: 80, maxQuantity: 600 },
    { storeId: store.id, productId: products[11].id, quantity: 100, minQuantity: 30, maxQuantity: 250 },
    { storeId: store.id, productId: products[12].id, quantity: 180, minQuantity: 40, maxQuantity: 350 },
    { storeId: store.id, productId: products[13].id, quantity: 220, minQuantity: 50, maxQuantity: 400 },
    { storeId: store.id, productId: products[14].id, quantity: 40, minQuantity: 10, maxQuantity: 100 },
    { storeId: store.id, productId: products[15].id, quantity: 75, minQuantity: 20, maxQuantity: 150 },
    { storeId: store.id, productId: products[16].id, quantity: 60, minQuantity: 15, maxQuantity: 130 },
    { storeId: store.id, productId: products[17].id, quantity: 50, minQuantity: 10, maxQuantity: 100 },
  ];

  await prisma.inventory.createMany({ data: stockLevels });

  console.log("  ✓ Inventory created");

  // ── 14. Purchase Orders ──────────────────────────────────────────────
  const dt = new Date();

  const po1 = await prisma.purchase.create({
    data: {
      storeId: store.id,
      supplierId: supp1.id,
      employeeId: stockEmployee.id,
      purchaseDate: new Date(dt.getTime() - 7 * 86400000),
      invoiceNumber: "INV-2024-001",
      totalAmount: 1780.0,
      notes: "Weekly beverage restock",
    },
  });

  const po2 = await prisma.purchase.create({
    data: {
      storeId: store.id,
      supplierId: supp2.id,
      employeeId: stockEmployee.id,
      purchaseDate: new Date(dt.getTime() - 5 * 86400000),
      invoiceNumber: "INV-2024-002",
      totalAmount: 940.0,
      notes: "Dairy shipment",
    },
  });

  const po3 = await prisma.purchase.create({
    data: {
      storeId: store.id,
      supplierId: supp5.id,
      employeeId: stockEmployee.id,
      purchaseDate: new Date(dt.getTime() - 3 * 86400000),
      invoiceNumber: "INV-2024-003",
      totalAmount: 560.0,
      notes: "Fresh produce order",
    },
  });

  await prisma.purchaseItem.createMany({
    data: [
      { purchaseId: po1.id, productId: products[0].id, quantity: 200, costPrice: 0.85 },
      { purchaseId: po1.id, productId: products[1].id, quantity: 300, costPrice: 0.30 },
      { purchaseId: po1.id, productId: products[2].id, quantity: 100, costPrice: 1.80 },
      { purchaseId: po2.id, productId: products[3].id, quantity: 120, costPrice: 1.10 },
      { purchaseId: po2.id, productId: products[4].id, quantity: 80, costPrice: 2.00 },
      { purchaseId: po2.id, productId: products[5].id, quantity: 60, costPrice: 2.50 },
      { purchaseId: po3.id, productId: products[10].id, quantity: 200, costPrice: 0.40 },
      { purchaseId: po3.id, productId: products[11].id, quantity: 150, costPrice: 0.80 },
    ],
  });

  console.log("  ✓ Purchase orders created");

  // ── 15. Sales ────────────────────────────────────────────────────────
  const sale1 = await prisma.sale.create({
    data: {
      storeId: store.id,
      employeeId: cashierEmployee.id,
      customerId: customers[0].id,
      saleDate: new Date(dt.getTime() - 2 * 86400000),
      totalAmount: 17.43,
      discount: 0,
      tax: 1.29,
    },
  });

  const sale2 = await prisma.sale.create({
    data: {
      storeId: store.id,
      employeeId: cashierEmployee.id,
      customerId: customers[1].id,
      saleDate: new Date(dt.getTime() - 1 * 86400000),
      totalAmount: 32.73,
      discount: 2.00,
      tax: 2.27,
    },
  });

  const sale3 = await prisma.sale.create({
    data: {
      storeId: store.id,
      employeeId: cashierEmployee2.id,
      saleDate: new Date(),
      totalAmount: 9.97,
      discount: 0,
      tax: 0.72,
    },
  });

  await prisma.saleItem.createMany({
    data: [
      { saleId: sale1.id, productId: products[0].id, quantity: 2, unitPrice: 1.50, discount: 0, tax: 0.24 },
      { saleId: sale1.id, productId: products[3].id, quantity: 1, unitPrice: 2.29, discount: 0, tax: 0.18 },
      { saleId: sale1.id, productId: products[6].id, quantity: 1, unitPrice: 2.49, discount: 0, tax: 0.20 },
      { saleId: sale1.id, productId: products[10].id, quantity: 3, unitPrice: 0.69, discount: 0, tax: 0 },
      { saleId: sale1.id, productId: products[12].id, quantity: 2, unitPrice: 3.29, discount: 0, tax: 0.53 },
      { saleId: sale2.id, productId: products[8].id, quantity: 2, unitPrice: 7.99, discount: 1.00, tax: 1.20 },
      { saleId: sale2.id, productId: products[11].id, quantity: 3, unitPrice: 1.99, discount: 0, tax: 0 },
      { saleId: sale2.id, productId: products[13].id, quantity: 1, unitPrice: 2.49, discount: 0, tax: 0.20 },
      { saleId: sale2.id, productId: products[14].id, quantity: 1, unitPrice: 6.99, discount: 1.00, tax: 0.48 },
      { saleId: sale3.id, productId: products[1].id, quantity: 2, unitPrice: 0.99, discount: 0, tax: 0.16 },
      { saleId: sale3.id, productId: products[7].id, quantity: 1, unitPrice: 3.29, discount: 0, tax: 0.26 },
      { saleId: sale3.id, productId: products[16].id, quantity: 1, unitPrice: 4.29, discount: 0, tax: 0.30 },
    ],
  });

  console.log("  ✓ Sales created");

  // ── 16. Payments ─────────────────────────────────────────────────────
  await prisma.payment.createMany({
    data: [
      { saleId: sale1.id, amount: 17.43, method: "CASH" },
      { saleId: sale2.id, amount: 32.73, method: "CARD" },
      { saleId: sale3.id, amount: 9.97, method: "CASH" },
    ],
  });

  console.log("  ✓ Payments created");

  // ── 17. Shifts ───────────────────────────────────────────────────────
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0);

  await prisma.shift.createMany({
    data: [
      {
        employeeId: cashierEmployee.id,
        cashRegisterId: reg1.id,
        startTime: new Date(todayStart.getTime() - 1 * 86400000),
        endTime: new Date(todayStart.getTime() - 1 * 86400000 + 8 * 3600000),
        openingCash: 200.0,
        closingCash: 1450.75,
      },
      {
        employeeId: cashierEmployee2.id,
        cashRegisterId: reg2.id,
        startTime: todayStart,
        endTime: null,
        openingCash: 200.0,
        closingCash: null,
      },
    ],
  });

  console.log("  ✓ Shifts created");

  // ── 18. Notifications ────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: adminUser.id, title: "Low Stock Alert", message: "SKU HSE-001 (Paper Towels) is below minimum threshold.", type: "STOCK_ALERT", isRead: false },
      { userId: adminUser.id, title: "Daily Sales Report", message: "Total sales for today: $9.97", type: "SALE_ALERT", isRead: true },
      { userId: cashierUser.id, title: "Shift Reminder", message: "Your shift starts in 30 minutes.", type: "SYSTEM", isRead: false },
      { userId: stockKeeperUser.id, title: "Overtime Approved", message: "Your overtime request for 2.5 hours was approved.", type: "OVERTIME", isRead: true },
      { userId: owner.id, title: "Weekly Summary", message: "Total revenue this week: $50.16 across 3 transactions.", type: "SYSTEM", isRead: false },
    ],
  });

  console.log("  ✓ Notifications created");

  // ── 19. Audit Logs ───────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      { userId: developer.id, action: "LOGIN", entity: "User", entityId: developer.id, ipAddress: "192.168.1.100" },
      { userId: adminUser.id, action: "CREATE", entity: "Product", entityId: products[0].id, newValue: JSON.stringify({ name: "Coca-Cola 355ml" }), ipAddress: "192.168.1.101" },
      { userId: adminUser.id, action: "CREATE", entity: "Employee", entityId: cashierEmployee.id, newValue: JSON.stringify({ employeeCode: "EMP-002" }), ipAddress: "192.168.1.101" },
      { userId: cashierUser.id, action: "CREATE", entity: "Sale", entityId: sale1.id, newValue: JSON.stringify({ totalAmount: 17.43 }), ipAddress: "192.168.1.102" },
      { userId: stockKeeperUser.id, action: "CREATE", entity: "Purchase", entityId: po1.id, newValue: JSON.stringify({ invoiceNumber: "INV-2024-001" }), ipAddress: "192.168.1.103" },
      { userId: adminUser.id, action: "UPDATE", entity: "Product", entityId: products[0].id, oldValue: JSON.stringify({ sellingPrice: 1.49 }), newValue: JSON.stringify({ sellingPrice: 1.50 }), ipAddress: "192.168.1.101" },
    ],
  });

  console.log("  ✓ Audit logs created");

  // ── Summary ──────────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════");
  console.log("  Seed completed successfully!");
  console.log("═══════════════════════════════════════════");
  console.log(`  Brand:           ${brand.name}`);
  console.log(`  Stores:          2`);
  console.log(`  Users:           6`);
  console.log(`  Employees:       4`);
  console.log(`  Roles:           4`);
  console.log(`  Permissions:     ${perms.length}`);
  console.log(`  Products:        ${products.length}`);
  console.log(`  Categories:      ${categories.length}`);
  console.log(`  Suppliers:       ${suppliers.length}`);
  console.log(`  Customers:       ${customers.length}`);
  console.log(`  Sales:           3`);
  console.log(`  Purchases:       3`);
  console.log(`  Notifications:   5`);
  console.log("═══════════════════════════════════════════");
  console.log("\n  Default password for all accounts: Admin@123");
  console.log("═══════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
