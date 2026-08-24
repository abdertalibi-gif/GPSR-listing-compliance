import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DocumentsPage() {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  let docs: Array<{ id: string; originalName: string; mimeType: string; size: number; type: string; createdAt: Date }> = [];
  if (userId) {
    const products = await prisma.product.findMany({ where: { userId }, select: { id: true } });
    const ids = products.map((p: { id: string }) => p.id);
    docs = await prisma.productDocument.findMany({ where: { productId: { in: ids } }, orderBy: { createdAt: "desc" }, take: 100 }) as never;
  } else {
    docs = [{ id: "d1", originalName: "manual.pdf", mimeType: "application/pdf", size: 245000, type: "MANUAL", createdAt: new Date() }];
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#14213D]">Document Center</h1>
      <Card><CardHeader><CardTitle>All documents</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-xs font-semibold text-slate-500"><tr><th className="px-4 py-3 text-left">File</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Size</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Actions</th></tr></thead><tbody>{docs.map((d: { id: string; originalName: string; type: string; size: number; createdAt: Date }) => <tr key={d.id} className="border-t border-slate-100"><td className="px-4 py-3 font-medium">{d.originalName}</td><td className="px-4 py-3">{d.type}</td><td className="px-4 py-3">{Math.round(d.size / 1024)} KB</td><td className="px-4 py-3">{new Date(d.createdAt).toLocaleDateString()}</td><td className="px-4 py-3 flex gap-1"><Button size="sm" variant="outline">Preview</Button><Button size="sm" variant="ghost">Download</Button></td></tr>)}{docs.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No documents uploaded yet.</td></tr>}</tbody></table></div></CardContent></Card>
    </div>
  );
}
