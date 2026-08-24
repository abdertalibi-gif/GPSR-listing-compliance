import "dotenv/config";
import { prisma } from "../src/lib/prisma";
async function main(){
  const reports = await prisma.complianceReport.findMany({ include: { product: { select: { name: true, userId: true } }, user: { select: { email: true } }, check: { select: { score: true, status: true } } }, orderBy: { createdAt: "desc" }, take: 10 });
  for(const r of reports){
    console.log(`${r.id} | reportId=${r.reportId} | user=${(r as any).user.email} | product=${(r as any).product.name} | score=${(r as any).check?.score} | status=${(r as any).check?.status} | created=${r.createdAt.toISOString()}`);
  }
  await prisma.$disconnect();
}
main().catch(async e=>{console.error(e); await prisma.$disconnect(); process.exit(1)});
