import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DownloadLink } from "@/components/reports/download-link";

export default async function ReportsPage() {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  let reports: Array<{ id: string; reportId: string; title: string; createdAt: Date; product: { name: string } }> = [];
  let error: string | null = null;
  if (userId) {
    try {
      reports = await prisma.complianceReport.findMany({ where: { userId }, include: { product: { select: { name: true } } }, orderBy: { createdAt: "desc" } }) as never;
    } catch (e) {
      console.error("[reports] db error", e);
      error = "Unable to load reports. Please try again.";
    }
  } else {
    reports = [
      { id: "r1", reportId: "RPT-ABC123", title: "GPSR Report — Wireless Bluetooth Headphones", createdAt: new Date(), product: { name: "Wireless Bluetooth Headphones" } },
    ];
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#14213D]">Reports</h1>
      {error && <div className="rounded-md bg-[#FEF2F2] border border-[#FECACA] p-3 text-sm text-[#EF4444]">{error}</div>}
      <Card><CardHeader><CardTitle>Professional audit-ready reports</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-[#F7F9FC] text-xs font-semibold text-[#64748B]"><tr><th className="px-4 py-3 text-left">Report</th><th className="px-4 py-3">Product</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Actions</th></tr></thead><tbody>{reports.map((r) => <tr key={r.id} className="border-t border-[#E7ECF3]"><td className="px-4 py-3 font-medium text-[#14213D]">{r.reportId}</td><td className="px-4 py-3">{r.product.name}</td><td className="px-4 py-3 text-[#64748B]">{new Date(r.createdAt).toLocaleString()}</td><td className="px-4 py-3 flex gap-1"><Button asChild size="sm" variant="outline"><Link href={`/dashboard/reports/${r.id}`}>View</Link></Button><Button asChild size="sm"><DownloadLink id={r.id}>Download PDF</DownloadLink></Button></td></tr>)}{!error && reports.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-[#64748B]">No reports yet. Run a GPSR check and a report is auto-generated.</td></tr>}</tbody></table></div></CardContent></Card>
    </div>
  );
}
