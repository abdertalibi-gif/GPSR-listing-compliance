import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const productId = form.get("productId") as string | null;
  const type = (form.get("type") as string) ?? "OTHER";
  if (!file || !productId) return NextResponse.json({ error: "Missing file or productId" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // In production, upload to S3/R2 and store storageKey; here store metadata
  const doc = await prisma.productDocument.create({
    data: {
      productId,
      fileName: `${Date.now()}-${file.name}`,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      storageKey: `products/${productId}/${Date.now()}-${file.name}`,
      type: type as never,
    },
  });
  await prisma.auditLog.create({ data: { userId, action: "DOCUMENT_UPLOADED", entity: "ProductDocument", entityId: doc.id, productId } });
  return NextResponse.json(doc, { status: 201 });
}
