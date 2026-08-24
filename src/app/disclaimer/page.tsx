import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
export default function DisclaimerPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-[#14213D]">Legal Disclaimer</h1>
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-amber-900">
          <p className="font-semibold">Important:</p>
          <p className="mt-2">This platform provides automated listing information checks and compliance support. It does not constitute legal advice, product certification, safety certification, or a guarantee of compliance with EU law.</p>
          <p className="mt-2">We use the terms “GPSR Listing Check”, “Compliance Information Check”, and “Listing Information Review”. We never claim “100% legally compliant”. A READY status means: “Required listing information appears complete based on the supplied information.”</p>
        </div>
        <p className="mt-6 text-sm text-slate-600">Always consult qualified legal counsel for regulatory decisions.</p>
      </main>
      <SiteFooter />
    </div>
  );
}
