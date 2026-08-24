import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
export async function GET() {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  if (!userId) return NextResponse.json([], { status: 200 });
  const reports = await prisma.complianceReport.findMany({ where: { userId }, include: { product: { select: { name: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(reports);
}
