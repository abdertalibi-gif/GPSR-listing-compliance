import "dotenv/config";
import { prisma } from "../src/lib/prisma";
async function main(){
  const r = await prisma.complianceReport.findFirst({ where:{ reportId:"cmt7hbkww0013unf02xg02m6b"}, include:{ user:{select:{email:true}}, product:{select:{name:true,userId:true}} }});
  console.log(JSON.stringify({ reportId:r?.reportId, id:r?.id, reportUserId:r?.userId, userEmail: (r as any)?.user?.email, productUserId: (r as any)?.product?.userId, productName: (r as any)?.product?.name }, null, 2));
  const users = await prisma.user.findMany({ select:{email:true,id:true, role:true}});
  console.log(users.map(u=>`${u.email}:${u.id.slice(0,8)}:${u.role}`));
  await prisma.$disconnect();
}
main().catch(async e=>{console.error(e); await prisma.$disconnect(); process.exit(1)});
