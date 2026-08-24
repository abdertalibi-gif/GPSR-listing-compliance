"use client";
import Link from "next/link";
import { ShieldCheck, Search, Bell, Sun } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { LanguageSwitcherCompact } from "@/components/language-switcher";

export function DashboardTopbar({ userName, userEmail }: { userName: string; userEmail: string }) {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between bg-[#1677E8] px-4 text-white shadow-sm">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#1677E8]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="hidden text-sm md:inline">GPSR Compliance</span>
        </Link>
        <div className="hidden items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-sm text-white/90 md:flex">
          <Search className="h-4 w-4 text-white/70" />
          <input placeholder={t("header.search")} className="w-48 bg-transparent placeholder:text-white/60 focus:outline-none" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcherCompact />
        <Link href="/dashboard/notifications" className="relative rounded-full p-2 hover:bg-white/15">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#EF4444] ring-2 ring-[#1677E8]" />
        </Link>
        <button className="rounded-full p-2 hover:bg-white/15">
          <Sun className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 rounded-full bg-white/10 px-2 py-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold text-[#1677E8]">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-semibold leading-none">{userName}</div>
            <div className="text-[10px] leading-none text-white/70">{userEmail}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
