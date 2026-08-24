export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateReportPdf } from "@/lib/pdf/report-pdf";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = (session?.user as unknown as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const url = new URL(req.url);
    const rawLocale = url.searchParams.get("lang") || url.searchParams.get("locale") || "en";
    const locale = (["en", "fr", "ar"].includes(rawLocale) ? rawLocale : "en") as "en" | "fr" | "ar";

    let report = await prisma.complianceReport.findUnique({
      where: { id },
      include: {
        product: { include: { manufacturer: true, responsiblePerson: true, safetyInfo: true, documents: true } },
        check: { include: { issues: true } },
        user: { select: { id: true, role: true } },
      },
    });
    if (!report) {
      // also try by reportId (user may pass reportId like cmt7hbkww0013...)
      report = await prisma.complianceReport.findUnique({
        where: { reportId: id },
        include: {
          product: { include: { manufacturer: true, responsiblePerson: true, safetyInfo: true, documents: true } },
          check: { include: { issues: true } },
          user: { select: { id: true, role: true } },
        },
      }) as never;
    }

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Ownership check: owner or admin
    const isOwner = report.userId === userId;
    let isAdmin = false;
    if (!isOwner) {
      try {
        const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
        isAdmin = dbUser?.role === "ADMIN";
      } catch {}
    }
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build PDF data from real stored report
    let issues: Array<{ title: string; code: string; category: string; severity: string; description: string; recommendation?: string | null; field?: string | null }> = [];
    let score = 0;
    let status = "UNKNOWN";
    let checkCreatedAt: Date = report.createdAt;
    let passedChecks: Array<{ label: string; rule: string }> = [];

    const RULE_LABELS: Record<string, string> = {
      BASIC_NAME_MISSING: "Product name",
      BASIC_BRAND_MISSING: "Brand information",
      MFG_NAME_MISSING: "Manufacturer name",
      MFG_ADDRESS_MISSING: "Manufacturer address",
      MFG_CONTACT_MISSING: "Manufacturer contact",
      RP_REQUIRED_MISSING: "Responsible Person",
      RP_ADDRESS_MISSING: "Responsible Person address",
      RP_CONTACT_MISSING: "Responsible Person contact",
      ID_SKU_MISSING: "Product identifier",
      ID_GTIN_FORMAT: "GTIN format",
      SAFETY_WARNINGS_MISSING: "Safety warnings",
      SAFETY_INSTRUCTIONS_MISSING: "Safety instructions",
      DOC_MISSING: "Supporting documents",
    };

    if (report.check) {
      score = report.check.score;
      status = report.check.status;
      checkCreatedAt = report.check.createdAt;
      issues = report.check.issues.map((iss) => ({
        title: iss.title,
        code: iss.code,
        category: iss.category,
        severity: iss.severity,
        description: iss.description,
        recommendation: iss.recommendation,
        field: (iss as unknown as { field?: string | null }).field ?? null,
      }));
    } else if (report.content && typeof report.content === "object") {
      const content = report.content as unknown as { score?: number; status?: string; issues?: typeof issues; checks?: Array<{ rule: string; passed: boolean }> };
      if (typeof content.score === "number") score = content.score;
      if (typeof content.status === "string") status = content.status;
      if (Array.isArray(content.issues)) issues = content.issues;
      if (Array.isArray(content.checks)) {
        passedChecks = content.checks.filter((c) => c.passed).map((c) => ({ rule: c.rule, label: RULE_LABELS[c.rule] ?? c.rule.replace(/_/g, " ").toLowerCase() }));
      }
    }

    // Also try to get passed from content if check exists but content has checks
    if (passedChecks.length === 0 && report.content && typeof report.content === "object") {
      const content = report.content as unknown as { checks?: Array<{ rule: string; passed: boolean }> };
      if (Array.isArray(content?.checks)) {
        passedChecks = content.checks.filter((c) => c.passed).map((c) => ({ rule: c.rule, label: RULE_LABELS[c.rule] ?? c.rule.replace(/_/g, " ").toLowerCase() }));
      }
    }

    const product = report.product as unknown as {
      name: string;
      brand?: string | null;
      sku?: string | null;
      modelNumber?: string | null;
      gtin?: string | null;
      category?: string | null;
      countryOfOrigin?: string | null;
      manufacturer?: { name?: string | null; street?: string | null; city?: string | null; postalCode?: string | null; country?: string | null; email?: string | null; phone?: string | null } | null;
      responsiblePerson?: { company?: string | null; street?: string | null; city?: string | null; postalCode?: string | null; country?: string | null; email?: string | null; phone?: string | null; isRequired?: boolean } | null;
      documents?: Array<{ id: string }>;
    };

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = generateReportPdf(
        {
          reportId: report.reportId,
          title: report.title,
          createdAt: report.createdAt,
          product: {
            name: product.name,
            brand: product.brand,
            sku: product.sku,
            modelNumber: product.modelNumber,
            gtin: product.gtin,
            category: product.category,
            countryOfOrigin: product.countryOfOrigin,
            manufacturer: product.manufacturer ?? null,
            responsiblePerson: product.responsiblePerson ?? null,
            documentsCount: (product as unknown as { documents?: Array<unknown> }).documents?.length ?? 0,
          },
          check: report.check
            ? { score, status, summary: report.check.summary, createdAt: checkCreatedAt }
            : { score, status, summary: null, createdAt: checkCreatedAt },
          issues,
          passedChecks,
        },
        locale
      );
    } catch (e) {
      console.error("[pdf] generation failed", { reportId: id, error: e });
      return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
    }

    // Validate PDF magic
    if (!pdfBuffer.slice(0, 4).toString().startsWith("%PDF")) {
      console.error("[pdf] invalid magic", { reportId: id });
      return NextResponse.json({ error: "PDF generation error" }, { status: 500 });
    }

    const filename = `gpsr-report-${report.reportId}.pdf`;
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch (e) {
    console.error("[pdf] unexpected error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
