"use client";
import { useI18n } from "@/lib/i18n/context";
import { locales, localeNames, type Locale } from "@/lib/i18n/dictionaries";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="flex items-center gap-1 rounded-lg border border-[#E7ECF3] bg-white p-1">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l as Locale)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${locale === l ? "bg-[#EA580C] text-white" : "text-[#64748B] hover:bg-[#FFF7ED] hover:text-[#EA580C]"}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function LanguageSwitcherCompact() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="relative">
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="appearance-none rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 pr-8 text-xs font-medium text-white backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/20"
      >
        {locales.map((l) => (
          <option key={l} value={l} className="text-[#14213D]">
            {localeNames[l]}
          </option>
        ))}
      </select>
      <Globe className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-white/70" />
    </div>
  );
}
