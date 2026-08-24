"use client";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n/context";

export function SiteHeader() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E7ECF3] bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EA580C] text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-[#14213D]">GPSR Listing Compliance</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[#64748B] md:flex">
          <Link href="/features" className="hover:text-[#14213D]">{t("public.features.title")}</Link>
          <Link href="/#how-it-works" className="hover:text-[#14213D]">How it works</Link>
          <Link href="/pricing" className="hover:text-[#14213D]">{t("public.pricing.title")}</Link>
          <Link href="/faq" className="hover:text-[#14213D]">{t("public.faq.title")}</Link>
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/login">{t("auth.login")}</Link>
          </Button>
          <Button asChild className="bg-[#EA580C] hover:bg-[#C2410C]">
            <Link href="/register">{t("auth.register")}</Link>
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-center border-t border-[#E7ECF3] bg-[#F7F9FC] px-4 py-2 md:hidden">
        <LanguageSwitcher />
      </div>
    </header>
  );
}
