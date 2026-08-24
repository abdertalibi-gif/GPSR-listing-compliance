import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const faqs = [
  { q: "Is a READY status a legal certificate?", a: "No. READY means required listing information appears complete based on the information you supplied. It is not legal certification, and we never display '100% legally compliant'." },
  { q: "What score means what?", a: "0–49 Incomplete, 50–79 Needs Review, 80–99 Almost Ready, 100 Listing Information Complete. We explain exactly why points are deducted." },
  { q: "How is the EU Responsible Person handled?", a: "We add a checkbox 'Manufacturer is established outside the EU'. If enabled, we require RP company, address, and contact. We never auto-invent this data." },
  { q: "Are my documents public?", a: "No. Documents are stored with metadata and private storage keys. Access is verified server-side for owner/admin only." },
  { q: "Can I compare checks?", a: "Yes. The Checks page lets you view and compare previous vs current checks, showing fixed, new, and remaining issues." },
];
export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-[#14213D]">FAQ</h1>
        <div className="mt-6 space-y-4">
          {faqs.map((f) => (
            <Card key={f.q}><CardHeader><CardTitle className="text-base">{f.q}</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">{f.a}</p></CardContent></Card>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
