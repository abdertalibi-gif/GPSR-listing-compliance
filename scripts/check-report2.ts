import "dotenv/config";
import { prisma } from "../src/lib/prisma";
async function main(){
  const report = await prisma.complianceReport.findUnique({ where: { id: "cmt7hbkww0012unf06svdyz7m" }, include: { product: true, check: { include: { issues: true } } } });
  if(!report) {console.log("not found"); return;}
  console.log("reportId", report.reportId);
  console.log("title", report.title);
  console.log("product", { name: (report.product as any).name, brand:(report.product as any).brand, sku:(report.product as any).sku, gtin:(report.product as any).gtin, category:(report.product as any).category });
  console.log("check", report.check ? { score: (report.check as any).score, status: (report.check as any).status, createdAt: (report.check as any).createdAt } : "no check");
  console.log("issues", (report.check as any)?.issues?.map((i:any)=>({code:i.code, severity:i.severity, title:i.title})));
  console.log("content", report.content);
  await prisma.$disconnect();
}
main().catch(async e=>{console.error(e); await prisma.$disconnect(); process.exit(1)});
