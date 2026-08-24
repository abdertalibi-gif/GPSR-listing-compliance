import "dotenv/config";
import { prisma } from "../src/lib/prisma";
async function main(){
  const report = await prisma.complianceReport.findFirst({
    where: { reportId: "cmt7hbkww0013unf02xg02m6b" },
    include: {
      product: { include: { manufacturer: true, responsiblePerson: true, safetyInfo: true, documents: true } },
      check: { include: { issues: true } },
    }
  }) as any;
  if(!report) { console.log("not found"); return; }
  console.log("REPORT", report.reportId, report.title);
  console.log("PRODUCT", {
    name: report.product.name,
    brand: report.product.brand,
    sku: report.product.sku,
    gtin: report.product.gtin,
    modelNumber: report.product.modelNumber,
    category: report.product.category,
    countryOfOrigin: report.product.countryOfOrigin,
  });
  console.log("MANUFACTURER", report.product.manufacturer);
  console.log("RP", report.product.responsiblePerson);
  console.log("SAFETY", report.product.safetyInfo);
  console.log("DOCS", report.product.documents.length);
  console.log("CHECK", report.check ? { score: report.check.score, status: report.check.status, issues: report.check.issues.length } : "no check");
  console.log("CONTENT keys", Object.keys(report.content || {}));
  const content = report.content as any;
  if(content){
    console.log("content.score", content.score);
    console.log("content.status", content.status);
    console.log("content.checks", content.checks?.slice(0,5));
    console.log("content.issues", content.issues?.map((i:any)=>({code:i.code, title:i.title, severity:i.severity})));
    console.log("content.missingFields", content.missingFields);
  }
  await prisma.$disconnect();
}
main().catch(async e=>{console.error(e); const {prisma}=await import("../src/lib/prisma"); await prisma.$disconnect(); process.exit(1)});
