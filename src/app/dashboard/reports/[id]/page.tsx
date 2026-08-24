import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { DownloadPdfButton } from "@/components/reports/download-button";
import { CheckCircle2, AlertTriangle, XCircle, Info, FileText, MapPin, ShieldCheck, Package } from "lucide-react";

// Human-readable labels for passed checks
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

const FIELD_LABELS: Record<string, string> = {
  brand: "Brand",
  sku: "SKU",
  "manufacturer.name": "Manufacturer name",
  "manufacturer.street": "Manufacturer address",
  "responsiblePerson.company": "Responsible Person",
  name: "Product name",
  "safety.warnings": "Safety warnings",
  "safety.instructions": "Safety instructions",
  documents: "Documents",
  gtin: "GTIN",
};

function getScoreMeta(score: number, status: string) {
  if (status === "READY" || status === "PASSED") return { label: "Excellent", color: "#10B981", bg: "#F0FDF4", text: "Listing information appears complete." };
  if (score >= 75) return { label: "Needs Review", color: "#EA580C", bg: "#FFF7ED", text: "Good progress — a few improvements needed." };
  return { label: "Action Required", color: "#EF4444", bg: "#FEF2F2", text: "Missing critical information — action required." };
}

function CircularScore({ score, status }: { score: number; status: string }) {
  const meta = getScoreMeta(score, status);
  const pct = Math.max(0, Math.min(100, score));
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-28 w-28">
        <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} stroke="#E7ECF3" strokeWidth="8" fill="none" />
          <circle
            cx="50"
            cy="50"
            r={r}
            stroke={meta.color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-[#14213D]">{score}</span>
          <span className="text-xs text-[#64748B]">/ 100</span>
        </div>
      </div>
      <Badge variant={status === "READY" || status === "PASSED" ? "success" : status === "NEEDS_REVIEW" ? "warning" : "destructive"} className="mt-2">
        {status.replace("_", " ")}
      </Badge>
      <p className="mt-1 text-center text-xs text-[#64748B]">{meta.text}</p>
    </div>
  );
}

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  if (!userId) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let report: any = null;
  try {
    report = await prisma.complianceReport.findUnique({
      where: { id },
      include: {
        product: { include: { manufacturer: true, responsiblePerson: true, safetyInfo: true, documents: true } },
        check: { include: { issues: true } },
      },
    });
    if (!report) {
      report = await prisma.complianceReport.findUnique({
        where: { reportId: id },
        include: { product: { include: { manufacturer: true, responsiblePerson: true, safetyInfo: true, documents: true } }, check: { include: { issues: true } } },
      });
    }
  } catch (e) {
    console.error("[report page] db error", e);
  }

  if (!report) return notFound();

  if (report.userId !== userId) {
    try {
      const u = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      if (u?.role !== "ADMIN") return notFound();
    } catch {
      return notFound();
    }
  }

  const product = report.product as {
    name: string;
    brand?: string | null;
    sku?: string | null;
    modelNumber?: string | null;
    gtin?: string | null;
    category?: string | null;
    countryOfOrigin?: string | null;
    manufacturer?: { name?: string | null; street?: string | null; city?: string | null; postalCode?: string | null; country?: string | null; email?: string | null; phone?: string | null } | null;
    responsiblePerson?: { isRequired?: boolean; company?: string | null; street?: string | null; city?: string | null; postalCode?: string | null; country?: string | null; email?: string | null; phone?: string | null } | null;
    safetyInfo?: { warnings?: string | null; instructions?: string | null } | null;
    documents?: Array<{ id: string }>;
  };
  const check = report.check as { score: number; status: string; summary?: string | null; createdAt: Date; issues: Array<{ title: string; code: string; category: string; severity: string; description: string; recommendation?: string | null; field?: string | null }> } | null;

  const score = check?.score ?? (report.content as unknown as { score?: number })?.score ?? 0;
  const status = check?.status ?? (report.content as unknown as { status?: string })?.status ?? "UNKNOWN";
  const issues = (check?.issues ?? (report.content as unknown as { issues?: Array<{ title: string; code: string; category: string; severity: string; description: string; recommendation?: string | null; field?: string | null }> })?.issues ?? []) as Array<{ title: string; code: string; category: string; severity: string; description: string; recommendation?: string | null; field?: string | null }>;
  const contentChecks = (report.content as unknown as { checks?: Array<{ rule: string; passed: boolean }> })?.checks ?? [];

  const passedChecks = contentChecks.filter((c) => c.passed).map((c) => ({
    rule: c.rule,
    label: RULE_LABELS[c.rule] ?? c.rule.replace(/_/g, " ").toLowerCase(),
  }));

  // If content checks not available, infer passed from missing issues (fallback)
  const fallbackPassed = passedChecks.length === 0 && issues.length > 0 ? [] : passedChecks;

  const recommendations = issues.map((iss, idx) => ({
    num: idx + 1,
    title: iss.title,
    rec: iss.recommendation ?? "Review the missing information.",
  }));

  const formatDate = (d: Date) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#EA580C]">
            <ShieldCheck className="h-4 w-4" /> GPSR Listing Compliance
          </div>
          <h1 className="mt-1 text-2xl font-bold text-[#14213D]">GPSR Compliance Report</h1>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[#334155]">
              <span className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5 text-[#64748B]" /> Product: <span className="font-semibold text-[#14213D]">{product.name}</span></span>
              <span>Report ID: <span className="font-mono text-xs text-[#14213D]">{report.reportId}</span></span>
            </div>
            <div className="text-xs text-[#64748B]">Generated: {formatDate(report.createdAt)} • Check: {formatDate(check?.createdAt ?? report.createdAt)}</div>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <Badge variant={status === "READY" || status === "PASSED" ? "success" : status === "NEEDS_REVIEW" ? "warning" : "destructive"} className="text-sm px-3 py-1">
            {status.replace("_", " ")}
          </Badge>
          <DownloadPdfButton reportId={report.reportId} id={report.id} />
        </div>
      </div>

      {/* Score Section */}
      <Card className="border-[#E7ECF3]">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-[200px_1fr]">
            <CircularScore score={score} status={status} />
            <div className="space-y-3">
              <h3 className="font-semibold text-[#14213D]">Compliance Score</h3>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
                <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, score))}%`, background: getScoreMeta(score, status).color }} />
              </div>
              <p className="text-sm text-[#334155]">
                {score >= 90 ? "Excellent — listing information appears complete." : score >= 75 ? "Needs review — a few improvements will make the listing ready." : "Action required — critical information is missing."}
              </p>
              <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
                <div className="rounded-lg bg-[#F7F9FC] border border-[#E7ECF3] p-3">
                  <div className="font-bold text-[#14213D] text-lg">{issues.length}</div>
                  <div className="text-[#64748B]">Issues</div>
                </div>
                <div className="rounded-lg bg-[#FEF2F2] border border-[#FECACA] p-3">
                  <div className="font-bold text-[#EF4444] text-lg">{issues.filter((i) => i.severity === "CRITICAL").length}</div>
                  <div className="text-[#64748B]">Critical</div>
                </div>
                <div className="rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] p-3">
                  <div className="font-bold text-[#10B981] text-lg">{passedChecks.length || fallbackPassed.length || 0}</div>
                  <div className="text-[#64748B]">Passed</div>
                </div>
              </div>
              {check?.summary && <p className="text-xs text-[#64748B]">{check.summary}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm"><FileText className="h-4 w-4 text-[#EA580C]" /> Product Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-2">
          {[
            ["Product name", product.name],
            ["Brand", product.brand],
            ["SKU", product.sku],
            ["GTIN", product.gtin],
            ["Model", product.modelNumber],
            ["Category", product.category],
            ["Country of origin", product.countryOfOrigin],
            ["Manufacturer", product.manufacturer?.name],
            ["Manufacturer address", product.manufacturer ? [product.manufacturer.street, product.manufacturer.city, product.manufacturer.postalCode, product.manufacturer.country].filter(Boolean).join(", ") : null],
            ["Manufacturer contact", product.manufacturer?.email || product.manufacturer?.phone],
            ["Responsible Person", product.responsiblePerson?.isRequired ? product.responsiblePerson.company : "Not required"],
            ["Responsible Person address", product.responsiblePerson?.isRequired ? [product.responsiblePerson.street, product.responsiblePerson.city, product.responsiblePerson.postalCode, product.responsiblePerson.country].filter(Boolean).join(", ") : null],
            ["Document status", product.documents && product.documents.length > 0 ? `${product.documents.length} document(s)` : "Not provided"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 border-b border-[#F1F5F9] py-2 last:border-0">
              <span className="font-medium text-[#334155]">{label}</span>
              <span className="text-right text-[#14213D]">{value && String(value).trim() ? String(value) : <span className="text-[#94A3B8]">Not provided</span>}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Passed Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-[#10B981]" /> Passed Checks</CardTitle>
          <CardDescription>Successful compliance checks</CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            const list = passedChecks.length ? passedChecks : fallbackPassed;
            if (list.length === 0) return <p className="text-sm text-[#64748B]">No passed checks recorded.</p>;
            return (
              <div className="grid gap-2 md:grid-cols-2">
                {list.map((p) => (
                  <div key={p.rule} className="flex items-center gap-2 rounded-lg border border-[#E7ECF3] bg-[#F7F9FC] px-3 py-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#10B981]" />
                    <span className="text-[#334155]">{p.label}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            {issues.some((i) => i.severity === "CRITICAL") ? <XCircle className="h-4 w-4 text-[#EF4444]" /> : <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />}
            Detected Issues ({issues.length})
          </CardTitle>
          <CardDescription>Grouped by severity. Critical issues require immediate action.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {issues.length === 0 ? (
            <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] p-4 text-sm text-[#10B981] flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> No issues — listing information appears complete.</div>
          ) : (
            <>
              {["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"].map((sev) => {
                const group = issues.filter((i) => i.severity === sev);
                if (group.length === 0) return null;
                return (
                  <div key={sev} className="space-y-2">
                    <h4 className="text-xs font-semibold tracking-widest text-[#64748B]">{sev} ({group.length})</h4>
                    {group.map((iss) => {
                      const fieldLabel = iss.field ? FIELD_LABELS[iss.field] ?? iss.field : null;
                      return (
                        <div key={iss.code} className={`rounded-[12px] border p-4 ${iss.severity === "CRITICAL" ? "border-[#FECACA] bg-[#FEF2F2]" : iss.severity === "HIGH" ? "border-[#FDE68A] bg-[#FFFBEB]" : "border-[#E7ECF3] bg-white"}`}>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={iss.severity === "CRITICAL" ? "destructive" : iss.severity === "HIGH" ? "warning" : iss.severity === "LOW" ? "secondary" : "info"}>{iss.severity}</Badge>
                            {fieldLabel && <span className="inline-flex items-center gap-1 text-xs text-[#64748B]"><MapPin className="h-3 w-3" /> {fieldLabel}</span>}
                          </div>
                          <div className="mt-2 font-semibold text-[#14213D]">{iss.title}</div>
                          <div className="mt-1 text-sm text-[#334155]">{iss.description}</div>
                          {iss.recommendation && (
                            <div className="mt-2 rounded-md bg-[#FFF7ED] border border-[#FED7AA] p-2 text-xs text-[#14213D]">
                              <span className="font-semibold">Recommendation:</span> {iss.recommendation}
                            </div>
                          )}
                          <details className="mt-2 text-xs">
                            <summary className="cursor-pointer text-[#EA580C] hover:underline">Technical details</summary>
                            <div className="mt-1 rounded bg-[#F7F9FC] border border-[#E7ECF3] p-2 font-mono text-[11px] text-[#64748B]">
                              Code: {iss.code} • Category: {iss.category} {iss.field ? `• Field: ${iss.field}` : ""}
                            </div>
                          </details>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm"><Info className="h-4 w-4 text-[#EA580C]" /> Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {recommendations.map((r) => (
              <div key={r.num} className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#EA580C] text-xs font-bold text-white">{r.num}</span>
                <span className="text-[#334155]">{r.rec}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-[#FDE68A] bg-[#FFFBEB]">
        <CardContent className="p-4 text-xs leading-5 text-[#92400E]">
          <span className="font-semibold">Disclaimer:</span> This platform provides automated listing information checks and compliance support. It does not constitute legal advice, product certification, safety certification, or a guarantee of compliance with EU law.
        </CardContent>
      </Card>
    </div>
  );
}
