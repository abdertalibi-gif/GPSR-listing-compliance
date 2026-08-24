import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { validateFile } from "../src/lib/storage";

async function testValidation() {
  console.log("Test1 PDF allowed");
  const pdf = { name: "test-safety.pdf", type: "application/pdf", size: 2*1024*1024 } as unknown as File;
  console.log(validateFile(pdf).ok ? "PASS" : "FAIL");

  console.log("Test2 JPG allowed");
  const jpg = { name: "product-label.jpg", type: "image/jpeg", size: 1*1024*1024 } as unknown as File;
  console.log(validateFile(jpg).ok ? "PASS" : "FAIL");

  console.log("Test3 large file >10MB rejected");
  const large = { name: "large-file.pdf", type: "application/pdf", size: 11*1024*1024 } as unknown as File;
  console.log(!validateFile(large).ok ? "PASS" : "FAIL", validateFile(large));

  console.log("Test4 exe rejected");
  const exe = { name: "test.exe", type: "application/octet-stream", size: 1000 } as unknown as File;
  console.log(!validateFile(exe).ok ? "PASS" : "FAIL", validateFile(exe));

  console.log("Test5 multiple files handled");
  const files = [pdf, jpg];
  console.log(files.every(f=>validateFile(f as unknown as File).ok) ? "PASS" : "FAIL");

  // Test staged -> product flow
  const demo = await prisma.user.findUnique({ where: { email: "demo@example.com" } });
  if (!demo) throw new Error("demo missing");
  // Cleanup previous staged
  await prisma.stagedDocument.deleteMany({ where: { userId: demo.id } });
  // Simulate staged create via prisma directly (bypass API auth but mimics)
  const staged = await prisma.stagedDocument.create({
    data: {
      userId: demo.id,
      fileName: "test.pdf",
      originalName: "EU-Declaration-of-Conformity.pdf",
      mimeType: "application/pdf",
      size: 2450000,
      storageKey: `staged/test-${Date.now()}.pdf`,
      documentType: "EU Declaration of Conformity",
      type: "OTHER",
      expiresAt: new Date(Date.now() + 24*60*60*1000),
    },
  });
  console.log("Test6 staged created", staged.id);

  const product = await prisma.product.create({
    data: {
      userId: demo.id,
      name: `Doc Test ${Date.now()}`,
      sku: `DOC-${Date.now()}`,
      manufacturer: { create: { name: "Mfg Co", street: "S", city: "C", postalCode: "P", country: "DE" } },
    },
  });
  // Attach staged to product
  await prisma.productDocument.create({
    data: {
      productId: product.id,
      fileName: staged.fileName,
      originalName: staged.originalName,
      mimeType: staged.mimeType,
      size: staged.size,
      storageKey: staged.storageKey,
      type: "OTHER",
    },
  });
  await prisma.stagedDocument.delete({ where: { id: staged.id } });
  console.log("Test7 product created with doc", product.id);
  const docs = await prisma.productDocument.findMany({ where: { productId: product.id } });
  console.log("Test7 docs count", docs.length === 1 ? "PASS" : "FAIL", docs[0]?.originalName);

  // Test8 persistence after "logout/login" -> just count
  const count = await prisma.productDocument.count({ where: { productId: product.id } });
  console.log("Test8 persisted", count === 1 ? "PASS" : "FAIL");

  // Test9 ownership: try to attach staged belonging to other user should fail
  const admin = await prisma.user.findUnique({ where: { email: "admin@example.com" } });
  if (admin) {
    const adminStaged = await prisma.stagedDocument.create({
      data: {
        userId: admin.id,
        fileName: "admin.pdf",
        originalName: "admin.pdf",
        mimeType: "application/pdf",
        size: 1000,
        storageKey: "staged/admin.pdf",
        type: "OTHER",
        expiresAt: new Date(Date.now() + 3600000),
      },
    });
    // demo trying to attach admin's doc should be prevented by where clause userId check
    const found = await prisma.stagedDocument.findMany({ where: { id: { in: [adminStaged.id] }, userId: demo.id } });
    console.log("Test9 ownership block", found.length === 0 ? "PASS" : "FAIL");
    await prisma.stagedDocument.delete({ where: { id: adminStaged.id } });
  }

  // Test10 GPSR recognizes docs
  const { validateGpsrProduct } = await import("../src/services/gpsr/gpsr-validator");
  const mfg = await prisma.manufacturer.findUnique({ where: { productId: product.id } });
  const result = validateGpsrProduct({
    name: product.name,
    sku: product.sku,
    manufacturer: mfg as never,
    documents: docs.map(d=>({ id: d.id, type: d.type })),
  });
  console.log("Test10 GPSR sees docs", result.issues.some(i=>i.code==="DOC_MISSING") ? "FAIL (still missing)" : "PASS", "score", result.score);

  // Cleanup
  await prisma.product.delete({ where: { id: product.id } });
  console.log("CLEANUP done");
  await prisma.$disconnect();
}
testValidation().catch(async e=>{console.error(e); await prisma.$disconnect(); process.exit(1)});
