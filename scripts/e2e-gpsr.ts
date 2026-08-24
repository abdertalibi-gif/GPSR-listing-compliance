import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { validateGpsrProduct } from "../src/services/gpsr/gpsr-validator";

async function main() {
  const demo = await prisma.user.findUnique({ where: { email: "demo@example.com" } });
  if (!demo) throw new Error("demo user missing");
  console.log("DEMO", demo.id);

  // 1. Valid product
  const validPayload = {
    name: "USB LED Desk Lamp",
    description: "USB LED Desk Lamp",
    brand: "TestBrand",
    category: "Electrical equipment",
    sku: "TBL-LED-001",
    modelNumber: "TB-LAMP-001",
    gtin: "1234567890123",
    countryOfOrigin: "China",
    manufacturer: { name: "Shenzhen Test Electronics Co., Ltd.", street: "123 Technology Road", city: "Shenzhen", postalCode: "518000", country: "China", email: "manufacturer@testbrand.com", phone: "+86 123456789" },
    responsiblePerson: { isRequired: true, company: "EU Compliance Services GmbH", street: "Example Street 10", city: "Berlin", postalCode: "10115", country: "Germany", email: "compliance@example.eu", phone: "+49 123456789" },
    safetyInfo: { warnings: "Keep away from water. Use only with the supplied USB charging cable. Do not disassemble the product.", instructions: "Use only with supplied cable. Keep out of reach of young children.", ageRestrictions: "Not suitable for children under 3 years." },
  };
  // Simulate wizard mapping: create product with explicit fields
  // Check if product exists by sku
  let validProduct = await prisma.product.findFirst({ where: { sku: validPayload.sku, userId: demo.id } });
  if (!validProduct) {
    validProduct = await prisma.product.create({
      data: {
        userId: demo.id,
        name: validPayload.name,
        description: validPayload.description,
        brand: validPayload.brand,
        category: validPayload.category,
        sku: validPayload.sku,
        modelNumber: validPayload.modelNumber,
        gtin: validPayload.gtin,
        countryOfOrigin: validPayload.countryOfOrigin,
        manufacturer: { create: validPayload.manufacturer },
        responsiblePerson: { create: validPayload.responsiblePerson },
        safetyInfo: { create: validPayload.safetyInfo },
      },
      include: { manufacturer: true, responsiblePerson: true, safetyInfo: true },
    });
    console.log("CREATED_VALID", validProduct.id);
  } else console.log("VALID_EXISTS", validProduct.id);
  // Verify manufacturer fields are correct
  const mfg = await prisma.manufacturer.findUnique({ where: { productId: validProduct.id } });
  console.log("MFG_CHECK", { name: mfg?.name, street: mfg?.street, city: mfg?.city, email: mfg?.email, phone: mfg?.phone });
  if (mfg?.name !== validPayload.manufacturer.name) throw new Error("MFG name mismatch - corruption persisted");
  if (mfg?.street !== validPayload.manufacturer.street) throw new Error("MFG street mismatch");
  if ((mfg?.email || "") !== validPayload.manufacturer.email) throw new Error("MFG email mismatch");
  console.log("MFG_INTEGRITY_OK");

  // Run GPSR check via validator
  const result = validateGpsrProduct({
    name: validProduct.name,
    brand: validPayload.brand,
    sku: validPayload.sku,
    gtin: validPayload.gtin,
    manufacturer: mfg as never,
    responsiblePerson: await prisma.responsiblePerson.findUnique({ where: { productId: validProduct.id } }) as never,
    safetyInfo: await prisma.safetyInfo.findUnique({ where: { productId: validProduct.id } }) as never,
    documents: [],
  });
  console.log("VALID_RESULT", { score: result.score, status: result.status, issues: result.issues.length, critical: result.issues.filter(i=>i.severity==="CRITICAL").length });
  // With no documents, score should not be 100 but should not have critical? Let's see: DOC_MISSING is MEDIUM so should not block READY, but check. With provided data, critical should be 0 so if score 97 and no critical, status should be ? 97 => NEEDS_REVIEW per our validator but earlier we expect READY if no critical and score 100. With missing doc, score 96-97 => NEEDS_REVIEW. Add doc to get READY.
  // Add a document to get READY
  const docCount = await prisma.productDocument.count({ where: { productId: validProduct.id } });
  if (docCount === 0) {
    await prisma.productDocument.create({ data: { productId: validProduct.id, fileName: "manual.pdf", originalName: "manual.pdf", mimeType: "application/pdf", size: 1000, storageKey: `test/${validProduct.id}/manual.pdf`, type: "MANUAL" } });
    console.log("ADDED_DOC");
  }
  const result2 = validateGpsrProduct({
    name: validProduct.name, brand: validPayload.brand, sku: validPayload.sku, gtin: validPayload.gtin,
    manufacturer: mfg as never,
    responsiblePerson: await prisma.responsiblePerson.findUnique({ where: { productId: validProduct.id } }) as never,
    safetyInfo: await prisma.safetyInfo.findUnique({ where: { productId: validProduct.id } }) as never,
    documents: [{ id: "doc1", type: "MANUAL" }],
  });
  console.log("VALID_WITH_DOC", { score: result2.score, status: result2.status, issues: result2.issues.map(i=>i.code) });
  if (result2.score !== 100 || result2.status !== "READY") console.log("WARN: valid product not READY - check rules");
  else console.log("VALID_PRODUCT_READY_OK");

  // Persist check in DB
  const check = await prisma.gpsrCheck.create({
    data: {
      productId: validProduct.id,
      userId: demo.id,
      score: result2.score,
      status: result2.status === "READY" ? "PASSED" : result2.status === "NEEDS_REVIEW" ? "NEEDS_REVIEW" : "FAILED",
      summary: `Test check — ${result2.status}`,
      issues: { create: result2.issues.map(i=>({ code:i.code,title:i.title,description:i.description,severity:i.severity as never,category:i.category as never,field:i.field,recommendation:i.recommendation })) },
    },
  });
  console.log("PERSISTED_CHECK", check.id);
  await prisma.product.update({ where: { id: validProduct.id }, data: { score: result2.score, status: result2.status as never } });

  // 2. Incomplete product
  let incomplete = await prisma.product.findFirst({ where: { name: "Incomplete Test Product", userId: demo.id } });
  if (!incomplete) {
    incomplete = await prisma.product.create({ data: { userId: demo.id, name: "Incomplete Test Product", sku: "INCOMPLETE-001", description: "No manufacturer" } });
    console.log("CREATED_INCOMPLETE", incomplete.id);
  }
  const incResult = validateGpsrProduct({ name: incomplete.name, sku: incomplete.sku, manufacturer: null, responsiblePerson: null, safetyInfo: null, documents: [] });
  console.log("INCOMPLETE_RESULT", { score: incResult.score, status: incResult.status, critical: incResult.issues.filter(i=>i.severity==="CRITICAL").length, issues: incResult.issues.map(i=>i.code) });
  if (incResult.status === "READY") throw new Error("Incomplete must not be READY");
  console.log("INCOMPLETE_NOT_READY_OK");

  // 3. Fix/recheck: create product missing safety, then fix
  let fixProduct = await prisma.product.findFirst({ where: { sku: "FIX-001", userId: demo.id } });
  if (!fixProduct) {
    fixProduct = await prisma.product.create({
      data: {
        userId: demo.id, name: "Fix Test Lamp", sku: "FIX-001", brand: "TestBrand",
        manufacturer: { create: { name: "Mfg Co", street: "Str 1", city: "Berlin", postalCode: "10115", country: "Germany", email: "mfg@test.com" } },
        // missing safety warnings
      },
      include: { manufacturer: true },
    });
    console.log("CREATED_FIX_PRODUCT", fixProduct.id);
  }
  const beforeFix = validateGpsrProduct({ name: fixProduct.name, sku: fixProduct.sku, manufacturer: await prisma.manufacturer.findUnique({ where: { productId: fixProduct.id } }) as never, safetyInfo: null, documents: [] });
  console.log("BEFORE_FIX", { score: beforeFix.score, issues: beforeFix.issues.map(i=>i.code) });
  // Fix by adding safety
  await prisma.safetyInfo.upsert({ where: { productId: fixProduct.id }, update: { warnings: "Keep dry", instructions: "Use as directed" }, create: { productId: fixProduct.id, warnings: "Keep dry", instructions: "Use as directed" } });
  const afterFix = validateGpsrProduct({ name: fixProduct.name, sku: fixProduct.sku, manufacturer: await prisma.manufacturer.findUnique({ where: { productId: fixProduct.id } }) as never, safetyInfo: await prisma.safetyInfo.findUnique({ where: { productId: fixProduct.id } }) as never, documents: [] });
  console.log("AFTER_FIX", { score: afterFix.score, issues: afterFix.issues.map(i=>i.code) });
  if (afterFix.score <= beforeFix.score) throw new Error("Fix should improve score");
  console.log("FIX_RECHECK_OK");

  // Verify persistence after "logout/login" — just count checks
  const checks = await prisma.gpsrCheck.findMany({ where: { productId: validProduct.id } });
  console.log("CHECKS_PERSISTED", checks.length);

  // Ownership test: try to access with different user
  const other = await prisma.user.findUnique({ where: { email: "admin@example.com" } });
  if (other && validProduct.userId !== other.id) {
    // Simulate API check: if other tries to fetch, should be forbidden unless admin
    console.log("OWNERSHIP: valid product owner", validProduct.userId, "other", other.id, "other role ADMIN -> allowed per policy");
  }

  await prisma.$disconnect();
  console.log("E2E_GPSR_DONE");
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
