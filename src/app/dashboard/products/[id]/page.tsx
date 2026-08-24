import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";

type Mfg = { name: string; tradeName?: string | null; companyName?: string | null; street?: string | null; city?: string | null; postalCode?: string | null; country?: string | null; email?: string | null; phone?: string | null; website?: string | null } | null;
type RP = { isRequired: boolean; company?: string | null; street?: string | null; city?: string | null; postalCode?: string | null; country?: string | null; email?: string | null; phone?: string | null; website?: string | null } | null;
type Safety = { warnings?: string | null; instructions?: string | null; ageRestrictions?: string | null; usageRestrictions?: string | null; assemblyInstructions?: string | null; storageInstructions?: string | null; disposalInstructions?: string | null; otherInfo?: string | null } | null;

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;

  const product = await prisma.product.findUnique({ where: { id }, include: { manufacturer: true, responsiblePerson: true, safetyInfo: true, documents: true, gpsrChecks: { include: { issues: true }, orderBy: { createdAt: "desc" }, take: 5 } } });

  if (!product) return notFound();
  // Ownership check
  if (userId && product.userId !== userId) {
    const u = await prisma.user.findUnique({ where: { id: userId } });
    if (u?.role !== "ADMIN") return notFound();
  }
  if (!userId && product.userId) {
    // In production require auth, but allow demo fallback is removed — show 404 for anon on real data
    // For now allow view if demo product? Keep strict: if no session and product is real, require login
    // But seed demo product belongs to demo user, so return notFound for anon
    return notFound();
  }

  const mfg = product.manufacturer as Mfg;
  const rp = product.responsiblePerson as RP;
  const safety = product.safetyInfo as Safety;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#14213D]">{product.name}</h1>
          <p className="text-sm text-[#64748B]">{product.sku ?? "No SKU"} • {product.brand ?? "No brand"} • {product.category ?? "No category"} • GTIN: {product.gtin ?? "—"}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-[#64748B]">Score {product.score}/100 • Status <Badge variant={product.status === "READY" ? "success" : product.status === "NEEDS_REVIEW" ? "warning" : product.status === "ARCHIVED" ? "outline" : "destructive"}>{product.status}</Badge></div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href={`/dashboard/products/${product.id}/check`}>Run GPSR Check</Link></Button>
          <Button asChild><Link href={`/dashboard/reports`}>Generate Report</Link></Button>
        </div>
      </div>

      {product.description && (
        <Card><CardHeader><CardTitle>Overview</CardTitle></CardHeader><CardContent><p className="text-sm leading-6 text-slate-700">{product.description}</p><div className="mt-2 text-xs text-slate-500">Country of origin: {product.countryOfOrigin ?? "—"} • Model: {product.modelNumber ?? "—"}</div></CardContent></Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Manufacturer</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {mfg ? (
              <>
                <div><span className="font-semibold">Name:</span> {mfg.name}</div>
                {mfg.tradeName && <div><span className="font-semibold">Trade name:</span> {mfg.tradeName}</div>}
                {mfg.companyName && <div><span className="font-semibold">Company:</span> {mfg.companyName}</div>}
                <div><span className="font-semibold">Address:</span> {[mfg.street, mfg.city, mfg.postalCode, mfg.country].filter(Boolean).join(", ") || "—"}</div>
                <div><span className="font-semibold">Email:</span> {mfg.email ?? "—"}</div>
                <div><span className="font-semibold">Phone:</span> {mfg.phone ?? "—"}</div>
                {mfg.website && <div><span className="font-semibold">Website:</span> <a href={mfg.website} target="_blank" className="text-[#EA580C] underline">{mfg.website}</a></div>}
              </>
            ) : <p className="text-slate-500">No manufacturer information.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>EU Responsible Person</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {rp ? (
              <>
                <div><span className="font-semibold">Required:</span> {rp.isRequired ? "Yes — manufacturer outside EU" : "No"}</div>
                {rp.isRequired ? (
                  <>
                    <div><span className="font-semibold">Company:</span> {rp.company ?? "—"}</div>
                    <div><span className="font-semibold">Address:</span> {[rp.street, rp.city, rp.postalCode, rp.country].filter(Boolean).join(", ") || "—"}</div>
                    <div><span className="font-semibold">Email:</span> {rp.email ?? "—"}</div>
                    <div><span className="font-semibold">Phone:</span> {rp.phone ?? "—"}</div>
                    {rp.website && <div><span className="font-semibold">Website:</span> {rp.website}</div>}
                  </>
                ) : <p className="text-slate-500">Not required for this product.</p>}
              </>
            ) : <p className="text-slate-500">No responsible person data.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Safety Information</CardTitle></CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-2">
          <div><div className="font-semibold">Warnings</div><div className="text-slate-600">{safety?.warnings || "—"}</div></div>
          <div><div className="font-semibold">Instructions</div><div className="text-slate-600">{safety?.instructions || "—"}</div></div>
          <div><div className="font-semibold">Age restrictions</div><div className="text-slate-600">{safety?.ageRestrictions || "—"}</div></div>
          <div><div className="font-semibold">Usage restrictions</div><div className="text-slate-600">{safety?.usageRestrictions || "—"}</div></div>
          {safety?.assemblyInstructions && <div><div className="font-semibold">Assembly</div><div className="text-slate-600">{safety.assemblyInstructions}</div></div>}
          {safety?.storageInstructions && <div><div className="font-semibold">Storage</div><div className="text-slate-600">{safety.storageInstructions}</div></div>}
          {safety?.disposalInstructions && <div><div className="font-semibold">Disposal</div><div className="text-slate-600">{safety.disposalInstructions}</div></div>}
          {safety?.otherInfo && <div className="md:col-span-2"><div className="font-semibold">Other</div><div className="text-slate-600">{safety.otherInfo}</div></div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
        <CardContent>
          {product.documents.length === 0 ? <p className="text-sm text-slate-500">No documents uploaded. Upload via Documents center after creation — validated for MIME and 10MB limit.</p> : (
            <ul className="space-y-2 text-sm">{product.documents.map((d) => (<li key={d.id} className="flex justify-between border-b border-slate-100 py-2"><span>{d.originalName} ({d.mimeType}, {Math.round(d.size / 1024)} KB)</span><span className="text-slate-500">{d.type}</span></li>))}</ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent GPSR Checks</CardTitle></CardHeader>
        <CardContent>
          {product.gpsrChecks.length === 0 ? <p className="text-sm text-slate-500">No checks yet. Run a GPSR check to see score, issues, and recommendations. Checks persist in PostgreSQL.</p> : (
            <ul className="space-y-3 text-sm">
              {product.gpsrChecks.map((c) => (
                <li key={c.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between"><span className="font-semibold">{new Date(c.createdAt).toLocaleString()} — Score {c.score}/100</span><Badge variant={c.status === "PASSED" ? "success" : c.status === "NEEDS_REVIEW" ? "warning" : "destructive"}>{c.status}</Badge></div>
                  <div className="mt-1 text-xs text-slate-500">{c.summary}</div>
                  <div className="mt-2 text-xs">{c.issues.length} issue(s): {c.issues.slice(0, 3).map((i) => i.code).join(", ")}{c.issues.length > 3 ? "…" : ""}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
