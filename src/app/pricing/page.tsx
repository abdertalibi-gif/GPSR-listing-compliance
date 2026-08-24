import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const plans = [
  { name: "Free", price: "€0", per: "/mo", cta: "Start Free", features: ["3 products", "5 GPSR checks / month", "1 report", "Document uploads (10MB)", "Email support"], highlight: false },
  { name: "Starter", price: "€19", per: "/mo", cta: "Choose Starter", features: ["25 products", "100 checks / mo", "Unlimited reports", "Bulk check (10)", "Priority email support"], highlight: false },
  { name: "Professional", price: "€49", per: "/mo", cta: "Choose Professional", features: ["150 products", "500 checks / mo", "Bulk check (100)", "Audit logs", "Stripe-ready billing"], highlight: true },
  { name: "Business", price: "€99", per: "/mo", cta: "Choose Business", features: ["Unlimited products", "Unlimited checks", "Team access (coming)", "SSO (coming)", "Dedicated support"], highlight: false },
  { name: "Enterprise", price: "Custom", per: "", cta: "Contact Sales", features: ["Custom limits", "On-premise options", "Custom rules", "SLA & audit", "Invoice billing"], highlight: false },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-6 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#14213D]">Pricing — configurable, Stripe-ready</h1>
          <p className="mx-auto mt-3 max-w-2xl text-[#64748B]">All plans include transparent scoring, issue guidance, and PDF reports. Pricing is configurable via <code>SystemSettings</code>. No hardcoded payment — Stripe integration is prepared but not required to run.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-5">
          {plans.map((p) => (
            <Card key={p.name} className={p.highlight ? "ring-2 ring-[#EA580C] bg-[#FFF7ED] border-[#FED7AA] shadow-lg" : ""}>
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
                {p.highlight && <span className="inline-flex w-fit rounded-full bg-[#EA580C] px-2.5 py-0.5 text-xs font-semibold text-white">Recommended</span>}
                <div className="text-2xl font-bold text-[#14213D]">{p.price}<span className="text-sm font-normal text-[#64748B]">{p.per}</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">{p.features.map((f) => <li key={f} className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />{f}</li>)}</ul>
                <Button className="mt-6 w-full" variant={p.highlight ? "default" : "outline"} asChild><Link href="/register">{p.cta}</Link></Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-slate-500">Prices shown are examples. Manage plans in /admin/settings or SystemSettings table. Stripe keys stored in env, never exposed to client.</p>
      </main>
      <SiteFooter />
    </div>
  );
}
