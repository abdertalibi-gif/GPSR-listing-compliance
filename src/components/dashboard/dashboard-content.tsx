"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, ClipboardCheck, CheckCircle2, AlertTriangle, AlertOctagon, FileText, Folder, BarChart3, Plus, Play, Download, Upload, Calendar, TrendingUp } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

type Stats = { total: number; compliant: number; needsReview: number; critical: number; checks: number; reports: number; documents: number; avgScore: number; incomplete: number };

export function DashboardContent({ stats, recentProducts, recentChecks, userName }: { stats: Stats; recentProducts: Array<{ id: string; name: string; sku: string; status: string; score: number }>; recentChecks: Array<{ id: string; productName: string; score: number; status: string; createdAt: Date }>; userName: string }) {
  const { t } = useI18n();

  const statCards = [
    { label: t("dashboard.products"), value: stats.total, change: "+12% ce mois", icon: Package, bg: "#FFF7ED", color: "#EA580C" },
    { label: t("dashboard.checks"), value: stats.checks, change: "+8% ce mois", icon: ClipboardCheck, bg: "#FFF7ED", color: "#EA580C" },
    { label: t("dashboard.compliant"), value: stats.compliant, change: "+5% ce mois", icon: CheckCircle2, bg: "#ECFDF5", color: "#10B981" },
    { label: t("dashboard.needsReview"), value: stats.needsReview, change: "3 ce mois", icon: AlertTriangle, bg: "#FFFBEB", color: "#F59E0B" },
    { label: t("dashboard.critical"), value: stats.critical, change: "-2% ce mois", icon: AlertOctagon, bg: "#FEF2F2", color: "#EF4444" },
    { label: t("dashboard.reports"), value: stats.reports, change: "+4 ce mois", icon: FileText, bg: "#FFF7ED", color: "#EA580C" },
    { label: t("dashboard.documents"), value: stats.documents, change: "+6 ce mois", icon: Folder, bg: "#F7F9FC", color: "#64748B" },
    { label: t("dashboard.score"), value: `${stats.avgScore}%`, change: "+3% ce mois", icon: BarChart3, bg: "#ECFDF5", color: "#10B981" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#14213D] md:text-2xl">{t("dashboard.greeting", { name: userName })}</h1>
          <p className="text-sm text-[#64748B]">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-[#E7ECF3] bg-white px-3 py-1.5 text-sm md:flex">
            <Calendar className="h-4 w-4 text-[#64748B]" />
            <span className="text-[#334155]">30 derniers jours</span>
          </div>
          <Button variant="outline" className="hidden md:inline-flex">Exporter</Button>
          <Button asChild className="bg-[#EA580C] hover:bg-[#C2410C]"><Link href="/dashboard/products/new">{t("dashboard.addProduct")}</Link></Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((c) => (
          <Card key={c.label} className="border-[#E7ECF3]">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-medium text-[#64748B]">{c.label}</div>
                  <div className="mt-1 text-xl font-bold text-[#14213D]">{c.value}</div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-[#10B981]">
                    <TrendingUp className="h-3 w-3" /> {c.change}
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: c.bg, color: c.color }}>
                  <c.icon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-sm">{t("dashboard.activity")}</CardTitle>
            <div className="flex gap-1 text-xs">
              <span className="rounded-full bg-[#FFF7ED] px-2 py-1 text-[#EA580C]">7 jours</span>
              <span className="px-2 py-1 text-[#64748B]">30 jours</span>
              <span className="hidden px-2 py-1 text-[#64748B] md:inline">6 mois</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-44 rounded-lg bg-[#F7F9FC] p-3">
              <div className="flex h-full items-end gap-1.5">
                {[40, 65, 45, 80, 60, 90, 70].map((h, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div className="w-full rounded-t bg-[#EA580C]" style={{ height: `${h}%`, opacity: 0.9 }} />
                    <div className="w-full rounded-t bg-[#10B981]" style={{ height: `${h * 0.6}%`, opacity: 0.6 }} />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-[#64748B]">
                <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
              </div>
            </div>
            <div className="mt-3 flex gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#EA580C]" /> GPSR Checks</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#10B981]" /> Passed</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#EF4444]" /> Failed</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">{t("dashboard.status")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative h-36 w-36">
              <svg viewBox="0 0 100 100" className="h-36 w-36 -rotate-90">
                <circle cx="50" cy="50" r="32" fill="none" stroke="#E7ECF3" strokeWidth="10" />
                <circle cx="50" cy="50" r="32" fill="none" stroke="#10B981" strokeWidth="10" strokeDasharray={`${(stats.compliant / Math.max(1, stats.total)) * 201} 201`} strokeLinecap="round" />
                <circle cx="50" cy="50" r="32" fill="none" stroke="#F59E0B" strokeWidth="10" strokeDasharray={`${(stats.needsReview / Math.max(1, stats.total)) * 201} 201`} strokeDashoffset={`-${(stats.compliant / Math.max(1, stats.total)) * 201}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-[#14213D]">{stats.avgScore}%</span>
                <span className="text-xs text-[#64748B]">Score moyen</span>
              </div>
            </div>
            <div className="mt-3 w-full space-y-1.5 text-xs">
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#10B981]" /> Compliant</span><span>{stats.compliant}</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#F59E0B]" /> Needs Review</span><span>{stats.needsReview}</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#EF4444]" /> Action Required</span><span>{stats.critical}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">{t("dashboard.recent")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {(recentChecks.length ? recentChecks : recentProducts.slice(0, 5).map((p) => ({ id: p.id, productName: p.name, score: p.score, status: p.status, createdAt: new Date() })) ).map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-lg border border-[#E7ECF3] px-3 py-2.5 hover:bg-[#F7F9FC]">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFF7ED] text-[#EA580C]">
                  <ClipboardCheck className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#14213D] truncate">New GPSR check completed</div>
                  <div className="text-xs text-[#64748B]">Product: {a.productName} • Score {a.score} • {a.status}</div>
                </div>
                <div className="text-xs text-[#94A3B8]">Il y a 10 min</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">{t("dashboard.quick")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2.5">
            <Button asChild className="justify-start gap-2 bg-[#EA580C] hover:bg-[#C2410C]"><Link href="/dashboard/products/new"><Plus className="h-4 w-4" /> {t("dashboard.addProduct")}</Link></Button>
            <Button asChild variant="outline" className="justify-start gap-2"><Link href="/dashboard/products"><Play className="h-4 w-4" /> {t("dashboard.newCheck")}</Link></Button>
            <Button asChild variant="outline" className="justify-start gap-2"><Link href="/dashboard/reports"><Download className="h-4 w-4" /> {t("dashboard.generateReport")}</Link></Button>
            <Button asChild variant="outline" className="justify-start gap-2"><Link href="/dashboard/documents"><Upload className="h-4 w-4" /> {t("dashboard.addDocument")}</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
