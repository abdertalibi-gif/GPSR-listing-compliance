"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getScoreLabel } from "@/lib/utils";

type CheckResult = {
  result: { status: string; score: number; issues: Array<{ code: string; title: string; description: string; severity: string; category: string; recommendation: string }>; checks: Array<{ rule: string; passed: boolean }> };
  check: { id: string; score: number; status: string };
};

export default function CheckPage() {
  const params = useParams() as { id: string };
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CheckResult | null>(null);
  const [history, setHistory] = useState<Array<{ id: string; score: number; status: string; createdAt: string }>>([]);

  const runCheck = async () => {
    setLoading(true);
    const res = await fetch(`/api/products/${params.id}/check`, { method: "POST" });
    const json = await res.json();
    setData(json);
    setLoading(false);
    if (json?.check) setHistory((h) => [{ id: json.check.id, score: json.check.score, status: json.check.status, createdAt: new Date().toISOString() }, ...h]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0f1f3c]">GPSR Listing Check</h1>
        <Button onClick={runCheck} disabled={loading}>{loading ? "Checking..." : "Run GPSR Check"}</Button>
      </div>

      {data ? (
        <>
          <Card className="border-2">
            <CardContent className="p-8 text-center">
              <div className="text-sm font-medium text-slate-500">Listing Information Score</div>
              <div className="mt-2 text-6xl font-bold" style={{ color: data.result.score >= 80 ? "#059669" : data.result.score >= 50 ? "#d97706" : "#EF4444" }}>{data.result.score}<span className="text-2xl font-normal text-slate-400">/100</span></div>
              <div className="mt-2">
                <Badge variant={data.result.status === "READY" ? "success" : data.result.status === "NEEDS_REVIEW" ? "warning" : "destructive"}>{data.result.status}</Badge>
              </div>
              <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600">
                {data.result.status === "READY" ? "Required listing information appears complete based on the supplied information." : "There are missing or incomplete listing fields. Review the issues below and fix them, then run the check again."}
              </p>
              <p className="mt-4 text-xs text-slate-400">This is a Listing Information Check, not legal certification.</p>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card><CardHeader><CardTitle>Checks</CardTitle></CardHeader><CardContent className="space-y-1 text-sm">{data.result.checks.map((c) => <div key={c.rule} className="flex justify-between"><span>{c.rule}</span><span className={c.passed ? "text-emerald-600" : "text-red-600"}>{c.passed ? "✓" : "✗"}</span></div>)}</CardContent></Card>
            <Card><CardHeader><CardTitle>Score breakdown</CardTitle></CardHeader><CardContent><div className="text-sm text-slate-600"><div>{getScoreLabel(data.result.score).label}</div><div className="mt-2 text-xs">0–49 Incomplete • 50–79 Needs Review • 80–99 Almost Ready • 100 Complete</div></div></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Issues ({data.result.issues.length})</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {data.result.issues.map((iss) => (
                <div key={iss.code} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-[#0f1f3c]">{iss.title}</div>
                    <Badge variant={iss.severity === "CRITICAL" ? "destructive" : iss.severity === "HIGH" ? "warning" : "secondary"}>{iss.severity}</Badge>
                  </div>
                  <div className="mt-1 text-sm text-slate-600">{iss.description}</div>
                  <div className="mt-2 text-xs text-slate-500"><span className="font-semibold">Category:</span> {iss.category}</div>
                  <div className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-900"><span className="font-semibold">Recommendation:</span> {iss.recommendation}</div>
                  <Button size="sm" variant="outline" className="mt-3">Fix issue</Button>
                </div>
              ))}
              {data.result.issues.length === 0 && <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">No issues — listing information appears complete.</div>}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card><CardContent className="p-8 text-center text-sm text-slate-500">No check yet. Click “Run GPSR Check” to analyze this product with transparent, configurable rules.</CardContent></Card>
      )}

      {history.length > 0 && (
        <Card><CardHeader><CardTitle>History</CardTitle></CardHeader><CardContent><ul className="space-y-2 text-sm">{history.map((h) => <li key={h.id} className="flex justify-between border-b border-slate-100 py-1"><span>{new Date(h.createdAt).toLocaleString()}</span><span>{h.score} — {h.status}</span></li>)}</ul></CardContent></Card>
      )}
    </div>
  );
}
