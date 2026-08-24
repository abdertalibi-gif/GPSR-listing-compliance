import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function ChecksPage() {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  let checks: Array<{ id: string; productId: string; score: number; status: string; createdAt: Date; product: { name: string } }> = [];
  let stats = { total: 0, passed: 0, needsReview: 0, critical: 0 };
  if (userId) {
    try {
      const [all, passed, needsReview] = await Promise.all([
        prisma.gpsrCheck.count({ where: { userId } }),
        prisma.gpsrCheck.count({ where: { userId, status: "PASSED" } }),
        prisma.gpsrCheck.count({ where: { userId, status: "NEEDS_REVIEW" } }),
      ]);
      checks = await prisma.gpsrCheck.findMany({ where: { userId }, include: { product: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 50 }) as never;
      stats = { total: all, passed, needsReview, critical: all - passed - needsReview };
    } catch {}
  } else {
    checks = [
      { id: "c1", productId: "demo1", score: 92, status: "PASSED", createdAt: new Date("2026-08-20T10:00:00Z"), product: { name: "Wireless Bluetooth Headphones" } },
      { id: "c2", productId: "demo2", score: 72, status: "NEEDS_REVIEW", createdAt: new Date("2026-08-19T10:00:00Z"), product: { name: "Stainless Steel Bottle" } },
    ];
    stats = { total: 2, passed: 1, needsReview: 1, critical: 0 };
  }

  const getStatusBadge = (s: string) => {
    if (s === "PASSED") return <Badge className="bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0]">PASSED</Badge>;
    if (s === "NEEDS_REVIEW") return <Badge className="bg-[#FFFBEB] text-[#F59E0B] border-[#FDE68A]">NEEDS REVIEW</Badge>;
    return <Badge className="bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]">FAILED</Badge>;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#14213D]">GPSR Checks</h1>
          <p className="text-sm text-[#64748B]">Review and monitor compliance checks.</p>
        </div>
        <Button asChild className="bg-[#EA580C] hover:bg-[#C2410C]"><Link href="/dashboard/products"><Plus className="h-4 w-4" /> New Check</Link></Button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          { label: "Total checks", value: stats.total },
          { label: "Passed", value: stats.passed },
          { label: "Needs Review", value: stats.needsReview },
          { label: "Critical", value: stats.critical },
        ].map((s) => (
          <Card key={s.label} className="border-[#E7ECF3]"><CardContent className="p-4"><div className="text-xs text-[#64748B]">{s.label}</div><div className="text-xl font-bold text-[#14213D]">{s.value}</div></CardContent></Card>
        ))}
      </div>

      <Card className="border-[#E7ECF3]">
        <CardContent className="p-3">
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <Input placeholder="Search checks..." className="pl-9" />
            </div>
            <Button variant="outline" size="sm">Filter</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#E7ECF3] overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F7F9FC] text-left text-xs font-semibold text-[#64748B]"><tr><th className="px-4 py-2.5">Product</th><th className="px-4 py-2.5">Score</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5">Date</th><th className="px-4 py-2.5">Actions</th></tr></thead>
              <tbody>
                {checks.map((c) => (
                  <tr key={c.id} className="border-t border-[#E7ECF3] hover:bg-[#F7F9FC]">
                    <td className="px-4 py-2.5 font-medium text-[#14213D]">{c.product.name}</td>
                    <td className="px-4 py-2.5"><span className={`font-semibold ${c.score >= 90 ? "text-[#10B981]" : c.score >= 75 ? "text-[#F59E0B]" : "text-[#EF4444]"}`}>{c.score}</span></td>
                    <td className="px-4 py-2.5">{getStatusBadge(c.status)}</td>
                    <td className="px-4 py-2.5 text-xs text-[#64748B]">{new Date(c.createdAt).toLocaleDateString("en-GB")}</td>
                    <td className="px-4 py-2.5 flex gap-1"><Button variant="outline" size="sm" asChild><Link href={`/dashboard/products/${c.productId}/check`}>View</Link></Button><Button variant="ghost" size="sm">Compare</Button></td>
                  </tr>
                ))}
                {checks.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-[#64748B]">No checks yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
