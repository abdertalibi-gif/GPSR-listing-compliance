import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
export async function GET() {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  if (!userId) return NextResponse.json([], { status: 200 });
  const checks = await prisma.gpsrCheck.findMany({ where: { userId }, include: { product: { select: { name: true, sku: true } }, issues: true }, orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json(checks);
}
