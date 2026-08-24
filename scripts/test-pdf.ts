import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { generateReportPdf } from "../src/lib/pdf/report-pdf";
import fs from "fs";

async function main() {
  const id = process.argv[2] || "cmt7hbkww0013unf02xg02m6b"; // try reportId
  let report = await prisma.complianceReport.findUnique({ where: { id }, include: { product: true, check: { include: { issues: true } } } }) as any;
  if (!report) {
    report = await prisma.complianceReport.findUnique({ where: { reportId: id }, include: { product: true, check: { include: { issues: true } } } }) as any;
  }
  if (!report) {
    // fallback to any report
    report = await prisma.complianceReport.findFirst({ orderBy: { createdAt: "desc" }, include: { product: true, check: { include: { issues: true } } } }) as any;
    console.log("FALLBACK to", report?.id, report?.reportId);
  }
  if (!report) throw new Error("no report");
  console.log("REPORT", { id: report.id, reportId: report.reportId, title: report.title, product: (report.product as any).name });

  const issues = report.check ? report.check.issues.map((iss:any)=>({ title: iss.title, code: iss.code, category: iss.category, severity: iss.severity, description: iss.description, recommendation: iss.recommendation })) : (report.content as any)?.issues ?? [];
  const score = report.check?.score ?? (report.content as any)?.score ?? 0;
  const status = report.check?.status ?? (report.content as any)?.status ?? "UNKNOWN";
  const product = report.product as any;

  const buf = generateReportPdf({
    reportId: report.reportId,
    title: report.title,
    createdAt: report.createdAt,
    product: { name: product.name, brand: product.brand, sku: product.sku, modelNumber: product.modelNumber, gtin: product.gtin, category: product.category, countryOfOrigin: product.countryOfOrigin },
    check: report.check ? { score, status, summary: report.check.summary, createdAt: report.check.createdAt } : { score, status, summary: null, createdAt: report.createdAt },
    issues,
  });

  console.log("PDF size", buf.length);
  console.log("Magic", buf.slice(0,4).toString());
  if (!buf.slice(0,4).toString().startsWith("%PDF")) throw new Error("not PDF");

  const text = buf.toString("utf8");
  const checks: Array<[string, boolean]> = [
    ["product name nn", text.includes("nn")],
    ["score 88", text.includes("88") || text.includes("88 / 100")],
    ["status NEEDS", text.includes("NEEDS")],
    ["issues BASIC_BRAND_MISSING", text.includes("BASIC_BRAND_MISSING")],
    ["issues ID_SKU_MISSING", text.includes("ID_SKU_MISSING")],
    ["disclaimer", text.includes("Disclaimer") || text.includes("does not constitute legal advice")],
    ["no raw JSON Check result", !text.includes('"score":') || !text.includes('"issues":')],
    ["no undefined", !text.includes("undefined")],
    ["brand header", text.includes("GPSR Listing Compliance")],
    ["reportId present", text.includes(report.reportId)],
  ];
  for (const [k,v] of checks) console.log(k, v ? "PASS" : "FAIL");
  const hasFail = checks.some(([,v])=>!v);
  console.log(hasFail ? "SOME FAIL" : "ALL PASS");

  // save for manual open
  const out = `C:\\Users\\Abde\\Desktop\\GPSR listing compliance\\tmp-${report.reportId}.pdf`;
  fs.writeFileSync(out, buf);
  console.log("SAVED", out);

  // test headers logic: simulate filename
  const filename = `gpsr-report-${report.reportId}.pdf`;
  console.log("filename", filename, filename.endsWith(".pdf") ? "PASS" : "FAIL");

  await prisma.$disconnect();
}
main().catch(async e=>{console.error(e); const {prisma: p} = await import("../src/lib/prisma"); await p.$disconnect(); process.exit(1)});
