import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const mfrs = await prisma.manufacturer.findMany({ include: { product: { select: { id: true, name: true, userId: true } } } });
  console.log("TOTAL_MANUFACTURERS", mfrs.length);
  const corrupted: typeof mfrs = [];
  for (const m of mfrs) {
    const suspicious = m.name.length > 180 || m.name.includes("Create Product") || m.name.includes("Dashboard") || m.name.includes("GPSR Compliance") || m.name.includes("Manufacturer name");
    if (suspicious) corrupted.push(m);
  }
  console.log("CORRUPTED_COUNT", corrupted.length);
  for (const c of corrupted) {
    console.log("CORRUPTED", { id: c.id, productId: c.productId, productName: c.product.name, mfgNameSnippet: c.name.slice(0, 120), street: c.street, city: c.city, email: c.email, phone: c.phone });
  }
  // Also check for email/phone leakage: where mfg email equals user's email but mfg name suspicious
  if (corrupted.length > 0) {
    // Delete corrupted products and cascade
    for (const c of corrupted) {
      await prisma.product.update({ where: { id: c.productId }, data: { deletedAt: new Date(), isArchived: true, status: "ARCHIVED" } });
      console.log("ARCHIVED_PRODUCT", c.productId);
      // Optionally hard delete manufacturer if you want to clean data:
      // await prisma.manufacturer.delete({ where: { id: c.id } });
    }
  }
  const remaining = await prisma.product.count({ where: { deletedAt: null } });
  console.log("REMAINING_ACTIVE_PRODUCTS", remaining);
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
