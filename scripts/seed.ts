import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import { validateGpsrProduct } from "../src/services/gpsr/gpsr-validator";

async function main() {
  console.log("Seeding Neon DB...");
  const email = "demo@example.com";
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        firstName: "Demo",
        lastName: "User",
        name: "Demo User",
        email,
        password: await bcrypt.hash("Demo1234!", 10),
        isActive: true,
        role: "USER",
      },
    });
    console.log("Created demo user", user.id);
  } else console.log("Demo user exists", user.id);

  let admin = await prisma.user.findUnique({ where: { email: "admin@example.com" } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        firstName: "Admin",
        lastName: "User",
        name: "Admin User",
        email: "admin@example.com",
        password: await bcrypt.hash("Admin1234!", 10),
        role: "ADMIN",
      },
    });
    console.log("Created admin", admin.id);
  }

  // Ensure subscription
  for (const u of [user, admin]) {
    const sub = await prisma.subscription.findUnique({ where: { userId: u.id } });
    if (!sub) await prisma.subscription.create({ data: { userId: u.id, plan: "FREE", status: "ACTIVE" } });
  }

  // Seed rules if empty
  const ruleCount = await prisma.gpsrRule.count();
  if (ruleCount === 0) {
    const { GPSR_RULES } = await import("../src/services/gpsr/rules");
    for (const r of GPSR_RULES) {
      await prisma.gpsrRule.create({ data: { code: r.code, title: r.title, description: r.description, category: r.category as never, severity: r.severity as never, required: r.required, weight: r.weight, enabled: r.enabled } });
    }
    console.log("Seeded", GPSR_RULES.length, "GPSR rules");
  }

  // Create demo product if none
  const existing = await prisma.product.findFirst({ where: { userId: user.id } });
  if (!existing) {
    const product = await prisma.product.create({
      data: {
        userId: user.id,
        name: "Wireless Bluetooth Headphones",
        description: "High quality headphones with noise cancellation.",
        brand: "Acme",
        category: "Electronics",
        sku: "WH-XB900",
        modelNumber: "XB900-2024",
        gtin: "4006381333931",
        countryOfOrigin: "Germany",
        manufacturer: { create: { name: "Acme Corp GmbH", street: "Industrial Str. 5", city: "Berlin", postalCode: "10115", country: "Germany", email: "info@acme.example", phone: "+49 30 123456" } },
        responsiblePerson: { create: { isRequired: false, company: "Acme EU Rep", street: "Rue de l'EU 10", city: "Paris", postalCode: "75001", country: "France", email: "rp@acme.example" } },
        safetyInfo: { create: { warnings: "Keep away from water. Risk of hearing damage at high volume.", instructions: "Charge fully before first use. Clean with dry cloth.", ageRestrictions: "Not suitable for children under 3 years." } },
      },
      include: { manufacturer: true, responsiblePerson: true, safetyInfo: true, documents: true },
    });
    console.log("Created product", product.id);

    // Run GPSR check
    const result = validateGpsrProduct({
      name: product.name,
      brand: product.brand,
      sku: product.sku,
      gtin: product.gtin,
      manufacturer: product.manufacturer as never,
      responsiblePerson: product.responsiblePerson as never,
      safetyInfo: product.safetyInfo as never,
      documents: [],
    });
    const check = await prisma.gpsrCheck.create({
      data: {
        productId: product.id,
        userId: user.id,
        score: result.score,
        status: result.status === "READY" ? "PASSED" : result.status === "NEEDS_REVIEW" ? "NEEDS_REVIEW" : "FAILED",
        summary: `GPSR Listing Check — ${result.status} (${result.score}/100)`,
        issues: { create: result.issues.map((i) => ({ code: i.code, title: i.title, description: i.description, severity: i.severity as never, category: i.category as never, field: i.field, recommendation: i.recommendation })) },
      },
    });
    await prisma.product.update({ where: { id: product.id }, data: { score: result.score, status: result.status as never } });
    await prisma.complianceReport.create({ data: { productId: product.id, checkId: check.id, userId: user.id, title: `GPSR Report — ${product.name}`, content: result as never } });
    console.log("GPSR check", check.id, "score", result.score, "status", result.status);
  } else console.log("Product already exists", existing.id);

  const counts = {
    users: await prisma.user.count(),
    products: await prisma.product.count(),
    checks: await prisma.gpsrCheck.count(),
    reports: await prisma.complianceReport.count(),
    rules: await prisma.gpsrRule.count(),
  };
  console.log("COUNTS", counts);
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
