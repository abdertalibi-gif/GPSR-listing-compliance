"use client";
import { useI18n } from "@/lib/i18n/context";

export function DownloadLink({ id, children }: { id: string; children: React.ReactNode }) {
  const { locale } = useI18n();
  return (
    <a href={`/api/reports/${id}/pdf?lang=${locale}`} download>
      {children}
    </a>
  );
}
