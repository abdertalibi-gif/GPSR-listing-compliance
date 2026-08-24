import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  { title: "Product Listing Check", desc: "Run a structured GPSR Listing Check returning score, status, and ranked issues." },
  { title: "Manufacturer Information", desc: "Capture manufacturer legal name, address, and contact for traceability." },
  { title: "EU Responsible Person", desc: "Conditional EU RP collection when manufacturer is outside the EU." },
  { title: "Product Identification", desc: "SKU, Model, GTIN, Barcode, Serial/Batch — at least one required, validated." },
  { title: "Safety Information", desc: "Warnings, instructions, restrictions — rich text with audit history." },
  { title: "Document Management", desc: "Private, validated uploads. PDF/DOCX/JPG/PNG/WebP with size & MIME checks." },
  { title: "Compliance Reports", desc: "Professional PDFs with product, checks, issues, recommendations, disclaimer and report ID." },
  { title: "Product History", desc: "Every GPSR check stored with compare view." },
  { title: "Bulk Checking", desc: "Select many products and run checks in parallel." },
  { title: "Issue Tracking", desc: "Issues with severity, category, field, recommendation and fix status." },
  { title: "Audit Logs", desc: "All user and admin actions timestamped with IP and metadata." },
  { title: "Notifications", desc: "Check completed, issues found, report ready — read/unread management." },
];

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold text-[#14213D]">Features</h1>
        <p className="mt-2 max-w-2xl text-slate-600">A complete, transparent GPSR Listing Information platform. No legal certification claims — only clear checks and guidance.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title}><CardHeader><CardTitle className="text-base">{f.title}</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">{f.desc}</p></CardContent></Card>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
