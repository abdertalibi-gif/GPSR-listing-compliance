"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export function DownloadPdfButton({ reportId, id }: { reportId: string; id: string }) {
  const { locale, t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${id}/pdf?lang=${locale}`, { credentials: "include" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(j.error || `Failed (${res.status})`);
      }
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/pdf")) throw new Error("Invalid response type");
      const blob = await res.blob();
      if (blob.size < 100) throw new Error("PDF empty");
      // verify magic
      const buf = await blob.slice(0, 4).arrayBuffer();
      const magic = new TextDecoder().decode(buf);
      if (!magic.startsWith("%PDF")) throw new Error("Invalid PDF");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disp = res.headers.get("content-disposition") || "";
      const m = disp.match(/filename="?([^"]+)"?/);
      a.download = m ? m[1] : `gpsr-report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to generate PDF. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={handleDownload} disabled={loading} className="bg-[#EA580C] hover:bg-[#C2410C]">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("common.loading")}</> : <><Download className="h-4 w-4" /> {t("common.download")}</>}
      </Button>
      {error && <span className="text-xs text-[#EF4444]">{error}</span>}
    </div>
  );
}
