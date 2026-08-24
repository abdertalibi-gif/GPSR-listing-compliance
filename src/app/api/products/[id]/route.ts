import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  const product = await prisma.product.findUnique({ where: { id }, include: { manufacturer: true, responsiblePerson: true, safetyInfo: true, documents: true, gpsrChecks: { include: { issues: true }, orderBy: { createdAt: "desc" }, take: 5 } } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (userId && product.userId !== userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const updated = await prisma.product.update({ where: { id }, data: { name: body.name, description: body.description, brand: body.brand, category: body.category, sku: body.sku, modelNumber: body.modelNumber, gtin: body.gtin } });
  await prisma.auditLog.create({ data: { userId, action: "PRODUCT_UPDATED", entity: "Product", entityId: id, productId: id } });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.product.update({ where: { id }, data: { isArchived: true, status: "ARCHIVED", deletedAt: new Date() } });
  await prisma.auditLog.create({ data: { userId, action: "PRODUCT_ARCHIVED", entity: "Product", entityId: id, productId: id } });
  return NextResponse.json({ success: true });
}
