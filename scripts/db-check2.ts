import "dotenv/config";
import { prisma } from "../src/lib/prisma";
async function main() {
  console.log("URL", process.env.DATABASE_URL?.slice(0, 50));
  const c = await prisma.$queryRaw`SELECT 1 as ok`;
  console.log("SQL_OK", c);
  const users = await prisma.user.count();
  console.log("USERS_COUNT", users);
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
