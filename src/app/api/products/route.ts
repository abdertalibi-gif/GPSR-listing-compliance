import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional(),
  brand: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  sku: z.string().trim().max(50).optional(),
  modelNumber: z.string().trim().max(50).optional(),
  gtin: z.string().trim().max(30).optional(),
  countryOfOrigin: z.string().trim().max(50).optional(),
  manufacturer: z.object({
    name: z.string().trim().min(1).max(200),
    tradeName: z.string().trim().max(200).optional(),
    companyName: z.string().trim().max(200).optional(),
    street: z.string().trim().min(1).max(300),
    city: z.string().trim().min(1).max(100),
    postalCode: z.string().trim().min(1).max(30),
    country: z.string().trim().min(1).max(100),
    email: z.string().trim().email().optional().or(z.literal("")),
    phone: z.string().trim().max(50).optional().or(z.literal("")),
    website: z.string().trim().url().optional().or(z.literal("")),
  }),
  responsiblePerson: z.object({
    isRequired: z.boolean().optional(),
    company: z.string().trim().max(200).optional().or(z.literal("")),
    street: z.string().trim().max(200).optional().or(z.literal("")),
    city: z.string().trim().max(100).optional().or(z.literal("")),
    postalCode: z.string().trim().max(30).optional().or(z.literal("")),
    country: z.string().trim().max(100).optional().or(z.literal("")),
    email: z.string().trim().email().optional().or(z.literal("")),
    phone: z.string().trim().max(50).optional().or(z.literal("")),
    website: z.string().trim().url().optional().or(z.literal("")),
  }).optional(),
  safetyInfo: z.object({
    warnings: z.string().trim().max(5000).optional().or(z.literal("")),
    instructions: z.string().trim().max(5000).optional().or(z.literal("")),
    ageRestrictions: z.string().trim().max(2000).optional().or(z.literal("")),
    usageRestrictions: z.string().trim().max(2000).optional().or(z.literal("")),
    assemblyInstructions: z.string().trim().max(5000).optional().or(z.literal("")),
    storageInstructions: z.string().trim().max(2000).optional().or(z.literal("")),
    disposalInstructions: z.string().trim().max(2000).optional().or(z.literal("")),
    otherInfo: z.string().trim().max(5000).optional().or(z.literal("")),
  }).optional(),
  stagedDocumentIds: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as unknown as { id?: string })?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const status = searchParams.get("status");
    const where: Record<string, unknown> = { userId, deletedAt: null };
    if (q) where["name"] = { contains: q, mode: "insensitive" };
    if (status) where["status"] = status;
    const products = await prisma.product.findMany({ where: where as never, orderBy: { updatedAt: "desc" }, include: { manufacturer: true, responsiblePerson: true, safetyInfo: true } });
    return NextResponse.json(products);
  } catch (e) {
    console.error("[api/products GET] db error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as unknown as { id?: string })?.id;
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      try {
        let demo = await prisma.user.findUnique({ where: { email: "demo@example.com" } });
        if (!demo) {
          demo = await prisma.user.create({ data: { firstName: "Demo", lastName: "User", name: "Demo User", email: "demo@example.com", isActive: true } });
          await prisma.subscription.create({ data: { userId: demo.id, plan: "FREE", status: "ACTIVE" } });
        }
        effectiveUserId = demo.id;
      } catch (e) {
        console.error("[api/products POST] demo fallback db error", e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
      }
    }
    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const d = parsed.data;

    // Explicit mapping — never pass raw body to Prisma
    const product = await prisma.product.create({
      data: {
        userId: effectiveUserId,
        name: d.name,
        description: d.description?.trim() ? d.description : null,
        brand: d.brand?.trim() ? d.brand : null,
        category: d.category?.trim() ? d.category : null,
        sku: d.sku?.trim() ? d.sku : null,
        modelNumber: d.modelNumber?.trim() ? d.modelNumber : null,
        gtin: d.gtin?.trim() ? d.gtin : null,
        countryOfOrigin: d.countryOfOrigin?.trim() ? d.countryOfOrigin : null,
        manufacturer: {
          create: {
            name: d.manufacturer.name,
            tradeName: d.manufacturer.tradeName?.trim() || null,
            companyName: d.manufacturer.companyName?.trim() || null,
            street: d.manufacturer.street,
            city: d.manufacturer.city,
            postalCode: d.manufacturer.postalCode,
            country: d.manufacturer.country,
            email: d.manufacturer.email?.trim() || null,
            phone: d.manufacturer.phone?.trim() || null,
            website: d.manufacturer.website?.trim() || null,
          },
        },
        responsiblePerson: d.responsiblePerson ? {
          create: {
            isRequired: !!d.responsiblePerson.isRequired,
            company: d.responsiblePerson.company?.trim() || null,
            street: d.responsiblePerson.street?.trim() || null,
            city: d.responsiblePerson.city?.trim() || null,
            postalCode: d.responsiblePerson.postalCode?.trim() || null,
            country: d.responsiblePerson.country?.trim() || null,
            email: d.responsiblePerson.email?.trim() || null,
            phone: d.responsiblePerson.phone?.trim() || null,
            website: d.responsiblePerson.website?.trim() || null,
          },
        } : undefined,
        safetyInfo: d.safetyInfo ? {
          create: {
            warnings: d.safetyInfo.warnings?.trim() || null,
            instructions: d.safetyInfo.instructions?.trim() || null,
            ageRestrictions: d.safetyInfo.ageRestrictions?.trim() || null,
            usageRestrictions: d.safetyInfo.usageRestrictions?.trim() || null,
            assemblyInstructions: d.safetyInfo.assemblyInstructions?.trim() || null,
            storageInstructions: d.safetyInfo.storageInstructions?.trim() || null,
            disposalInstructions: d.safetyInfo.disposalInstructions?.trim() || null,
            otherInfo: d.safetyInfo.otherInfo?.trim() || null,
          },
        } : undefined,
      },
    });

    // Attach staged documents (wizard Step 5) — verify ownership, prevent cross-user attach
    if (d.stagedDocumentIds && d.stagedDocumentIds.length > 0) {
      const staged = await prisma.stagedDocument.findMany({
        where: { id: { in: d.stagedDocumentIds }, userId: effectiveUserId, expiresAt: { gt: new Date() } },
      });
      if (staged.length !== d.stagedDocumentIds.length) {
        // Cleanup orphan protection: do not attach partial, but fail safely
        console.error("[api/products POST] staged docs ownership mismatch", { requested: d.stagedDocumentIds, found: staged.map((s) => s.id) });
        return NextResponse.json({ error: "Invalid document reference" }, { status: 400 });
      }
      for (const s of staged) {
        await prisma.productDocument.create({
          data: {
            productId: product.id,
            fileName: s.fileName,
            originalName: s.originalName,
            mimeType: s.mimeType,
            size: s.size,
            storageKey: s.storageKey,
            type: s.type as never,
          },
        });
      }
      // Cleanup staged after successful attach
      await prisma.stagedDocument.deleteMany({ where: { id: { in: staged.map((s) => s.id) } } });
    }

    await prisma.auditLog.create({ data: { userId: effectiveUserId, action: "PRODUCT_CREATED", entity: "Product", entityId: product.id, productId: product.id } });
    return NextResponse.json(product, { status: 201 });
  } catch (e) {
    console.error("[api/products POST] db error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
