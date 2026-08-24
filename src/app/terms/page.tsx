import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-[#14213D]">Terms of Service</h1>
        <p className="mt-4 text-sm text-slate-600">Template terms. Covers acceptable use, subscriptions, liability limitations, and that the platform is an information check, not legal advice.</p>
      </main>
      <SiteFooter />
    </div>
  );
}
