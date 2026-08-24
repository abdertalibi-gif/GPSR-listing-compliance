import { prisma } from "../src/lib/prisma";
async function main() {
  const c = await prisma.$queryRaw`SELECT 1 as ok`;
  console.log("SQL_OK", c);
  const users = await prisma.user.count();
  console.log("USERS_COUNT", users);
  const products = await prisma.product.count();
  console.log("PRODUCTS_COUNT", products);
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
