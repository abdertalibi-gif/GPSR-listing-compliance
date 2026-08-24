import "dotenv/config";
import { prisma } from "../src/lib/prisma";
async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "StagedDocument" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "fileName" TEXT NOT NULL,
      "originalName" TEXT NOT NULL,
      "mimeType" TEXT NOT NULL,
      "size" INTEGER NOT NULL,
      "storageKey" TEXT NOT NULL,
      "documentType" TEXT,
      "type" TEXT NOT NULL DEFAULT 'OTHER',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "StagedDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);
  console.log("CREATE_TABLE_OK");
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "StagedDocument_userId_idx" ON "StagedDocument"("userId");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "StagedDocument_expiresAt_idx" ON "StagedDocument"("expiresAt");`);
  console.log("INDEX_OK");
  // Also need to update Prisma client generate
  await prisma.$disconnect();
}
main().catch(async e=>{console.error(e); await prisma.$disconnect(); process.exit(1)});
