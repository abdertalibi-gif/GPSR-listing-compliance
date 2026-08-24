import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const id = "cmt7hbkww0013unf02xg02m6b";
  const r = await prisma.complianceReport.findUnique({ where: { id }, include: { product: true, check: { include: { issues: true } } } });
  console.log(r ? "FOUND" : "NOT_FOUND");
  if (r) {
    console.log({ reportId: r.reportId, title: r.title, product: (r.product as any).name, checkScore: (r.check as any)?.score, checkStatus: (r.check as any)?.status, issues: (r.check as any)?.issues?.map((i:any)=>i.code) });
  } else {
    const all = await prisma.complianceReport.findMany({ take: 3, orderBy: { createdAt: "desc" }, include: { product: { select: { name: true } } } });
    console.log("SOME_REPORTS", all.map(a=>({ id:a.id, reportId:a.reportId, product:(a.product as any).name, createdAt:a.createdAt })));
  }
  await prisma.$disconnect();
}
main().catch(async e=>{console.error(e); await prisma.$disconnect(); process.exit(1)});
