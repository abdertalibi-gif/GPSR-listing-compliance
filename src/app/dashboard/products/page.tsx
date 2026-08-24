import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const params = await searchParams;
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;

  let products: Array<{ id: string; name: string; brand?: string | null; sku: string | null; status: string; score: number; updatedAt: Date; category?: string | null }> = [];
  if (userId) {
    const where: Record<string, unknown> = { userId, deletedAt: null };
    if (params.q) where["name"] = { contains: params.q, mode: "insensitive" };
    if (params.status) where["status"] = params.status;
    products = await prisma.product.findMany({ where: where as never, orderBy: { updatedAt: "desc" }, take: 50, select: { id: true, name: true, brand: true, sku: true, status: true, score: true, updatedAt: true, category: true } }) as never;
  } else {
    products = [
      { id: "demo1", name: "Wireless Bluetooth Headphones", brand: "Acme", sku: "WH-XB900", status: "READY", score: 92, updatedAt: new Date(), category: "Electronics" },
      { id: "demo2", name: "Stainless Steel Bottle", brand: "Acme", sku: "SS-WB500", status: "NEEDS_REVIEW", score: 72, updatedAt: new Date(), category: "Kitchen" },
      { id: "demo3", name: "Kids Building Blocks", brand: "ToysCo", sku: "KB-200", status: "INCOMPLETE", score: 34, updatedAt: new Date(), category: "Toys" },
    ];
  }

  const getStatusBadge = (status: string) => {
    if (status === "READY") return <Badge className="bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0]">COMPLIANT</Badge>;
    if (status === "NEEDS_REVIEW") return <Badge className="bg-[#FFFBEB] text-[#F59E0B] border-[#FDE68A]">NEEDS REVIEW</Badge>;
    return <Badge className="bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]">ACTION REQUIRED</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#14213D]">Products</h1>
          <p className="text-sm text-[#64748B]">Manage and monitor your products.</p>
        </div>
        <Button asChild className="bg-[#EA580C] hover:bg-[#C2410C]"><Link href="/dashboard/products/new"><Plus className="h-4 w-4" /> Ajouter un produit</Link></Button>
      </div>

      <Card className="border-[#E7ECF3]">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <form className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                <Input name="q" placeholder="Rechercher par nom, SKU, marque..." defaultValue={params.q ?? ""} className="pl-9" />
              </div>
              <Button type="submit" className="bg-[#EA580C] hover:bg-[#C2410C]">Rechercher</Button>
            </form>
            <div className="flex gap-2">
              <Link href="/dashboard/products"><Button variant={(!params.status ? "default" : "outline") as never} size="sm">All</Button></Link>
              <Link href="/dashboard/products?status=READY"><Button variant="outline" size="sm">Compliant</Button></Link>
              <Link href="/dashboard/products?status=NEEDS_REVIEW"><Button variant="outline" size="sm">Needs Review</Button></Link>
              <Link href="/dashboard/products?status=INCOMPLETE"><Button variant="outline" size="sm">Action Required</Button></Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#E7ECF3] overflow-hidden">
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F7F9FC] text-left text-xs font-semibold text-[#64748B]">
                <tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">Brand</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Score</th><th className="px-4 py-3">Last check</th><th className="px-4 py-3">Actions</th></tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-[#E7ECF3] hover:bg-[#F7F9FC]">
                    <td className="px-4 py-3 font-medium text-[#14213D]">{p.name}</td>
                    <td className="px-4 py-3 text-[#64748B]">{p.brand ?? "—"}</td>
                    <td className="px-4 py-3 text-[#334155]">{p.sku ?? "—"}</td>
                    <td className="px-4 py-3">{getStatusBadge(p.status)}</td>
                    <td className="px-4 py-3"><span className={`font-semibold ${p.score >= 90 ? "text-[#10B981]" : p.score >= 75 ? "text-[#F59E0B]" : "text-[#EF4444]"}`}>{p.score}</span></td>
                    <td className="px-4 py-3 text-[#64748B] text-xs">{new Date(p.updatedAt).toLocaleDateString("en-GB")}</td>
                    <td className="px-4 py-3 flex gap-1">
                      <Button variant="outline" size="sm" asChild><Link href={`/dashboard/products/${p.id}`}>View</Link></Button>
                      <Button variant="ghost" size="sm" asChild><Link href={`/dashboard/products/${p.id}/check`}>Check</Link></Button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-[#64748B]">No products found.</td></tr>}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="grid gap-3 p-4 md:hidden">
            {products.map((p) => (
              <div key={p.id} className="rounded-xl border border-[#E7ECF3] bg-white p-4">
                <div className="flex items-start justify-between">
                  <div className="font-semibold text-[#14213D]">{p.name}</div>
                  {getStatusBadge(p.status)}
                </div>
                <div className="mt-2 text-xs text-[#64748B]">{p.brand ?? "—"} • {p.sku ?? "—"} • Score {p.score}</div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1"><Link href={`/dashboard/products/${p.id}`}>View</Link></Button>
                  <Button size="sm" asChild className="flex-1 bg-[#EA580C]"><Link href={`/dashboard/products/${p.id}/check`}>Check</Link></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
