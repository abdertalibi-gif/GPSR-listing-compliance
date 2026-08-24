import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { validateGpsrProduct } from "@/services/gpsr/gpsr-validator";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  let effectiveUserId = userId;
  if (!effectiveUserId) {
    let demo = await prisma.user.findUnique({ where: { email: "demo@example.com" } });
    if (!demo) demo = await prisma.user.create({ data: { firstName: "Demo", lastName: "User", name: "Demo User", email: "demo@example.com" } });
    effectiveUserId = demo.id;
  }
  const product = await prisma.product.findUnique({
    where: { id },
    include: { manufacturer: true, responsiblePerson: true, safetyInfo: true, documents: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Ownership check if real user
  if (userId && product.userId !== userId) {
    const u = await prisma.user.findUnique({ where: { id: userId } });
    if (u?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = validateGpsrProduct({
    name: product.name,
    description: product.description,
    brand: product.brand,
    sku: product.sku,
    modelNumber: product.modelNumber,
    gtin: product.gtin,
    manufacturer: product.manufacturer ? { name: product.manufacturer.name, street: product.manufacturer.street, city: product.manufacturer.city, postalCode: product.manufacturer.postalCode, country: product.manufacturer.country, email: product.manufacturer.email, phone: product.manufacturer.phone } : null,
    responsiblePerson: product.responsiblePerson ? { isRequired: product.responsiblePerson.isRequired, company: product.responsiblePerson.company, street: product.responsiblePerson.street, city: product.responsiblePerson.city, postalCode: product.responsiblePerson.postalCode, country: product.responsiblePerson.country, email: product.responsiblePerson.email } : null,
    safetyInfo: product.safetyInfo ? { warnings: product.safetyInfo.warnings, instructions: product.safetyInfo.instructions, ageRestrictions: product.safetyInfo.ageRestrictions } : null,
    documents: product.documents.map((d: { id: string; type: string }) => ({ id: d.id, type: d.type })),
  });

  const statusMap: Record<string, "PASSED" | "FAILED" | "NEEDS_REVIEW"> = { READY: "PASSED", NEEDS_REVIEW: "NEEDS_REVIEW", INCOMPLETE: "FAILED", DRAFT: "FAILED" };

  const check = await prisma.gpsrCheck.create({
    data: {
      productId: id,
      userId: effectiveUserId,
      score: result.score,
      status: statusMap[result.status] ?? "NEEDS_REVIEW",
      summary: `GPSR Listing Check — ${result.status} (${result.score}/100), ${result.issues.length} issue(s) found.`,
      issues: { create: result.issues.map((i: { code: string; title: string; description: string; severity: string; category: string; field?: string; recommendation: string }) => ({ code: i.code, title: i.title, description: i.description, severity: i.severity as never, category: i.category as never, field: i.field, recommendation: i.recommendation })) },
    },
    include: { issues: true },
  });

  await prisma.product.update({ where: { id }, data: { score: result.score, status: result.status as never } });
  await prisma.auditLog.create({ data: { userId: effectiveUserId, action: "GPSR_CHECK", entity: "GpsrCheck", entityId: check.id, productId: id, metadata: result as never } });
  await prisma.notification.create({ data: { userId: effectiveUserId, title: "GPSR check completed", message: `${product.name}: ${result.issues.length} issue(s) found — score ${result.score}/100 (${result.status}).`, type: "CHECK_COMPLETED", link: `/dashboard/products/${id}/check` } });

  // Auto-create report
  const report = await prisma.complianceReport.create({
    data: {
      productId: id,
      checkId: check.id,
      userId: effectiveUserId,
      title: `GPSR Report — ${product.name}`,
      content: result as never,
    },
  });

  return NextResponse.json({ check, report, result });
}
