import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-[#14213D]">About GPSR Listing Compliance</h1>
        <p className="mt-4 leading-7 text-slate-600">We help e-commerce sellers review product listings for EU General Product Safety Regulation (GPSR) information requirements: traceability, manufacturer details, EU Responsible Person where applicable, product identifiers, and safety information. Our platform provides automated Listing Information Checks, clear issue guidance, and audit-ready reports.</p>
        <p className="mt-4 leading-7 text-slate-600">We do not provide legal advice or certification. Our READY status means: “Required listing information appears complete based on the supplied information.” Always consult qualified legal counsel for compliance decisions.</p>
      </main>
      <SiteFooter />
    </div>
  );
}
