import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateFile, saveFile, deleteFile } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as unknown as { id?: string })?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const documentType = (form.get("documentType") as string) || null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Validate size + MIME + ext
    const v = validateFile(file);
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length !== file.size) {
      // size mismatch
    }
    const storageKey = await saveFile(buffer, file.name, "staged");

    const staged = await prisma.stagedDocument.create({
      data: {
        userId,
        fileName: storageKey.split("/").pop() || file.name,
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        storageKey,
        documentType,
        type: "OTHER",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      },
    });

    return NextResponse.json({ id: staged.id, name: staged.originalName, mimeType: staged.mimeType, size: staged.size, documentType: staged.documentType, storageKey: staged.storageKey }, { status: 201 });
  } catch (e) {
    console.error("[staged POST] error", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    const userId = (session?.user as unknown as { id?: string })?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const docs = await prisma.stagedDocument.findMany({ where: { userId, expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(docs);
  } catch (e) {
    console.error("[staged GET] error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as unknown as { id?: string })?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const doc = await prisma.stagedDocument.findUnique({ where: { id } });
    if (!doc || doc.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await deleteFile(doc.storageKey);
    await prisma.stagedDocument.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[staged DELETE] error", e);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
