"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n/context";
import { Globe } from "lucide-react";

export function LanguageSettings() {
  const { locale } = useI18n();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm"><Globe className="h-4 w-4 text-[#EA580C]" /> Language / Langue / اللغة</CardTitle>
        <CardDescription>Choose your preferred language. The entire interface will update instantly.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#334155]">Current: <span className="font-semibold">{locale.toUpperCase()}</span></span>
          <LanguageSwitcher />
        </div>
        <p className="text-xs text-[#64748B]">Arabic uses RTL layout (dir=&quot;rtl&quot;). English and French remain LTR.</p>
      </CardContent>
    </Card>
  );
}
