import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { generateReportPdf } from "../src/lib/pdf/report-pdf";
import fs from "fs";

async function main(){
  const report = await prisma.complianceReport.findFirst({ where: { reportId: "cmt7hbkww0013unf02xg02m6b" }, include: { product: { include: { manufacturer: true, responsiblePerson: true, documents: true } }, check: { include: { issues: true } } } }) as any;
  if(!report) throw new Error("report not found");
  const issues = report.check.issues.map((i:any)=>({ title:i.title, code:i.code, category:i.category, severity:i.severity, description:i.description, recommendation:i.recommendation, field: i.field }));
  const product = report.product;
  const baseData = {
    reportId: report.reportId,
    title: report.title,
    createdAt: report.createdAt,
    product: {
      name: product.name,
      brand: product.brand,
      sku: product.sku,
      gtin: product.gtin,
      modelNumber: product.modelNumber,
      category: product.category,
      countryOfOrigin: product.countryOfOrigin,
      manufacturer: product.manufacturer,
      responsiblePerson: product.responsiblePerson,
      documentsCount: product.documents.length,
    },
    check: { score: report.check.score, status: report.check.status, summary: report.check.summary, createdAt: report.check.createdAt },
    issues,
    passedChecks: [{ label: "Product name", rule: "BASIC_NAME_MISSING" }],
  };

  for(const locale of ["en","fr","ar"] as const){
    const buf = generateReportPdf(baseData as any, locale);
    console.log(`\nLOCALE ${locale} size ${buf.length} magic ${buf.slice(0,4).toString()}`);
    const text = buf.toString("utf8");
    // Check for translated strings
    const checks: Array<[string,boolean]> = [];
    if(locale==="en"){
      checks.push(["GPSR Listing Compliance", text.includes("GPSR Listing Compliance")]);
      checks.push(["Product Information", text.includes("Product Information")]);
      checks.push(["Brand information missing", text.includes("Brand information missing")]);
      checks.push(["Not provided", text.includes("Not provided")]);
    } else if(locale==="fr"){
      checks.push(["Conformité GPSR", text.includes("Conformité GPSR")]);
      checks.push(["Informations Produit", text.includes("Informations Produit")]);
      checks.push(["Marque", text.includes("Marque")]);
    } else if(locale==="ar"){
      checks.push(["الامتثال", text.includes("الامتثال")]);
      checks.push(["معلومات المنتج", text.includes("معلومات المنتج")]);
      // Check for RTL: should contain Arabic and not be empty
      checks.push(["Arabic not squares", !text.includes("□")]);
    }
    // Common checks for all
    checks.push(["%PDF", buf.slice(0,4).toString().startsWith("%PDF")]);
    checks.push(["no raw JSON", !text.includes('"score":')]);
    checks.push(["no undefined", !text.includes("undefined")]);
    for(const [k,v] of checks) console.log(`  ${k}: ${v?"PASS":"FAIL"}`);
    const out = `C:\\Users\\Abde\\Desktop\\GPSR listing compliance\\tmp-pdf-${locale}.pdf`;
    fs.writeFileSync(out, buf);
    console.log(`  SAVED ${out}`);
  }
  await prisma.$disconnect();
}
main().catch(async e=>{console.error(e); const {prisma}=await import("../src/lib/prisma"); await prisma.$disconnect(); process.exit(1)});
