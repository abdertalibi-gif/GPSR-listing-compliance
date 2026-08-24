import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
async function main(){
  const email="super@admin.com";
  const hashed=await bcrypt.hash("Super1234!",10);
  const u=await prisma.user.update({ where:{email}, data:{password:hashed, isActive:true}});
  console.log("RESET", u.email, u.id);
  // Also ensure demo has a nn report for testing
  const demo=await prisma.user.findUnique({ where:{email:"demo@example.com"}});
  if(demo){
    const existing=await prisma.product.findFirst({ where:{userId:demo.id, name:"nn"}});
    if(!existing){
      const prod=await prisma.product.create({ data:{
        userId:demo.id,
        name:"nn",
        brand: null,
        sku: null,
        manufacturer:{create:{name:"Test Mfg", street:"S", city:"C", postalCode:"P", country:"DE"}},
        safetyInfo:{create:{warnings:"test"}}
      }});
      const result={ score:88, status:"NEEDS_REVIEW", issues:[
        { code:"BASIC_BRAND_MISSING", title:"Brand information missing", description:"Brand helps traceability", category:"GENERAL", severity:"LOW", field:"brand", recommendation:"Consider adding brand", weight:2},
        { code:"ID_SKU_MISSING", title:"Product identifier missing", description:"At least one identifier required", category:"IDENTIFICATION", severity:"CRITICAL", field:"sku", recommendation:"Add identifier", weight:12}
      ]};
      const check=await prisma.gpsrCheck.create({ data:{
        productId:prod.id,
        userId:demo.id,
        score:88,
        status:"NEEDS_REVIEW",
        summary:"Demo check",
        issues:{ create: result.issues.map(i=>({ code:i.code, title:i.title, description:i.description, severity:i.severity as any, category:i.category as any, field:i.field, recommendation:i.recommendation }))}
      }});
      const report=await prisma.complianceReport.create({ data:{
        productId:prod.id,
        checkId:check.id,
        userId:demo.id,
        title:"GPSR Report — nn",
        content: result as any,
        reportId: `RPT-DEMO-${Date.now().toString(36).toUpperCase()}`
      }});
      console.log("CREATED DEMO REPORT", report.id, report.reportId);
    } else console.log("DEMO nn exists", existing.id);
  }
  await prisma.$disconnect();
}
main().catch(async e=>{console.error(e); await prisma.$disconnect(); process.exit(1)});
