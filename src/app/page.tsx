"use client";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Factory, UserCheck, Fingerprint, ShieldAlert, FileText, History, BarChart3, CheckCircle2, ArrowRight, Award } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function HomePage() {
  const { t, dir } = useI18n();
  return (
    <div className="flex min-h-screen flex-col" dir={dir}>
      <SiteHeader />
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#14213D] via-[#14213D] to-[#1e3a5f] md:from-[#14213D] md:to-white md:bg-none opacity-5 md:opacity-0" />
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <Badge variant="secondary" className="mb-4 bg-[#FFF7ED] text-[#EA580C] border-[#FED7AA]">
              EU General Product Safety Regulation
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-[#14213D] md:text-5xl">
              {t("public.home.title").split("GPSR")[0]} <span className="text-[#EA580C]">GPSR</span> {t("public.home.title").split("GPSR")[1] || "Requirements"}
            </h1>
            <p className="mt-4 text-lg leading-7 text-slate-600">
              {t("public.home.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/register">{t("public.home.cta")} <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">{t("public.home.viewPricing")}</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-slate-500">No legal certification claims. Listing Information Check only — you remain responsible for compliance.</p>
            <div className="mt-8 flex items-center gap-6 text-sm text-slate-600">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Manufacturer & RP checks</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> PDF audit reports</span>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EA580C] text-white"><ShieldCheck className="h-5 w-5" /></div>
                  <div>
                    <div className="text-sm font-semibold text-[#14213D]">Wireless Bluetooth Headphones</div>
                    <div className="text-xs text-slate-500">SKU: WH-XB900 • GTIN: 4006381333931</div>
                  </div>
                </div>
                <Badge variant="success">READY</Badge>
              </div>
              <div className="mt-6">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-slate-600">Listing Information Score</span>
                  <span className="text-3xl font-bold text-emerald-600">92<span className="text-base font-normal">/100</span></span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-2 w-[92%] rounded-full bg-emerald-600" />
                </div>
                <p className="mt-2 text-xs text-slate-500">Required listing information appears complete based on the supplied information.</p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-slate-50 p-3"><div className="font-semibold text-[#14213D]">Manufacturer</div><div className="text-slate-600">✓ Complete</div></div>
                <div className="rounded-lg bg-slate-50 p-3"><div className="font-semibold text-[#14213D]">EU Responsible Person</div><div className="text-slate-600">✓ Provided</div></div>
                <div className="rounded-lg bg-amber-50 p-3 border border-amber-200"><div className="font-semibold text-amber-800">Safety</div><div className="text-amber-700">1 recommendation</div></div>
                <div className="rounded-lg bg-slate-50 p-3"><div className="font-semibold text-[#14213D]">Documents</div><div className="text-slate-600">2 files</div></div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-slate-200 bg-white p-4 shadow-lg md:block">
              <div className="text-xs font-semibold text-[#14213D] flex items-center gap-2"><Award className="h-4 w-4 text-[#EA580C]" /> Audit-ready PDF report generated</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#E7ECF3] bg-[#F7F9FC]">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-xs font-semibold tracking-widest text-[#94A3B8]">
          {t("public.home.trusted")}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-[#14213D]">{t("public.features.title")}</h2>
          <p className="mt-3 text-[#64748B]">{t("public.features.subtitle")}</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { icon: Factory, title: t("public.features.manufacturerTitle"), desc: t("public.features.manufacturerDesc") },
            { icon: UserCheck, title: t("public.features.rpTitle"), desc: t("public.features.rpDesc") },
            { icon: Fingerprint, title: t("public.features.idTitle"), desc: t("public.features.idDesc") },
            { icon: ShieldAlert, title: t("public.features.safetyTitle"), desc: t("public.features.safetyDesc") },
            { icon: FileText, title: t("public.features.docTitle"), desc: t("public.features.docDesc") },
            { icon: BarChart3, title: t("public.features.reportTitle"), desc: t("public.features.reportDesc") },
            { icon: History, title: t("public.features.historyTitle"), desc: t("public.features.historyDesc") },
            { icon: ShieldCheck, title: t("public.features.issueTitle"), desc: t("public.features.issueDesc") },
            { icon: Award, title: t("public.features.auditTitle"), desc: t("public.features.auditDesc") },
          ].map((f) => (
            <Card key={f.title} className="hover:shadow-md transition-shadow border-[#E7ECF3]">
              <CardHeader>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EA580C] text-white"><f.icon className="h-4 w-4" /></div>
                <CardTitle className="mt-3 text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-sm text-[#64748B]">{f.desc}</p></CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-white border-y border-[#E7ECF3]">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-center text-3xl font-bold text-[#14213D]">{t("public.how.title")}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-5">
            {[
              { step: "1", title: t("public.how.step1Title"), desc: t("public.how.step1Desc") },
              { step: "2", title: t("public.how.step2Title"), desc: t("public.how.step2Desc") },
              { step: "3", title: t("public.how.step3Title"), desc: t("public.how.step3Desc") },
              { step: "4", title: t("public.how.step4Title"), desc: t("public.how.step4Desc") },
              { step: "5", title: t("public.how.step5Title"), desc: t("public.how.step5Desc") },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#EA580C] text-white font-bold">{s.step}</div>
                <div className="mt-3 font-semibold text-[#14213D]">{s.title}</div>
                <div className="mt-1 text-sm text-[#64748B]">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-center text-3xl font-bold text-[#14213D]">{t("public.pricing.title")}</h2>
        <p className="mt-2 text-center text-[#64748B]">{t("public.pricing.subtitle")}</p>
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {[
            { name: "Free", price: "€0", features: ["3 products", "5 checks / mo", "1 report"] },
            { name: "Starter", price: "€19", features: ["25 products", "100 checks / mo", "Unlimited reports"] },
            { name: "Professional", price: "€49", features: ["150 products", "500 checks / mo", "Bulk checking"] },
            { name: "Business", price: "€99", features: ["Unlimited products", "Unlimited checks", "Admin & audit logs"] },
          ].map((p, i) => (
            <Card key={p.name} className={i === 2 ? "ring-2 ring-[#EA580C] shadow-lg border-[#FED7AA]" : "border-[#E7ECF3]"}>
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
                <div className="text-2xl font-bold text-[#14213D]">{p.price}<span className="text-sm font-normal text-[#64748B]">/mo</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-sm text-[#64748B]">{p.features.map((f) => <li key={f} className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" />{f}</li>)}</ul>
                <Button className="mt-5 w-full" variant={i === 2 ? "default" : "outline"} asChild><Link href="/pricing">{t("common.view")}</Link></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-[#E7ECF3] bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-center text-2xl font-bold text-[#14213D]">{t("public.faq.title")}</h2>
          <div className="mt-8 space-y-4">
            {[
              { q: t("public.faq.q1"), a: t("public.faq.a1") },
              { q: t("public.faq.q2"), a: t("public.faq.a2") },
              { q: t("public.faq.q3"), a: t("public.faq.a3") },
            ].map((f) => (
              <Card key={f.q} className="border-[#E7ECF3]"><CardHeader><CardTitle className="text-base">{f.q}</CardTitle></CardHeader><CardContent><p className="text-sm text-[#64748B]">{f.a}</p></CardContent></Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#14213D]">
        <div className="mx-auto max-w-7xl px-6 py-12 text-center">
          <h2 className="text-2xl font-bold text-white">{t("public.cta.title")}</h2>
          <p className="mt-2 text-white/70">{t("public.cta.subtitle")}</p>
          <Button size="lg" className="mt-6 bg-[#EA580C] hover:bg-[#C2410C]" asChild><Link href="/register">{t("public.home.cta")}</Link></Button>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
