import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function NotificationsPage() {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  let notifications: Array<{ id: string; title: string; message: string; isRead: boolean; createdAt: Date; type: string }> = [];
  let error: string | null = null;
  if (userId) {
    try {
      notifications = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 }) as never;
    } catch (e) {
      console.error("[notifications] db error", e);
      error = "Unable to load notifications.";
    }
  } else {
    notifications = [
      { id: "n1", title: "GPSR check completed", message: "3 issues found for Stainless Steel Bottle.", isRead: false, createdAt: new Date("2026-08-20T09:00:00Z"), type: "CHECK_COMPLETED" },
      { id: "n2", title: "Your report is ready", message: "Report RPT-ABC123 is ready for download.", isRead: true, createdAt: new Date("2026-08-20T08:00:00Z"), type: "REPORT_READY" },
    ];
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#14213D]">Notifications</h1>
      {error && <div className="rounded-md bg-[#FEF2F2] border border-[#FECACA] p-3 text-sm text-[#EF4444]">{error}</div>}
      <Card><CardHeader><CardTitle>Inbox</CardTitle></CardHeader><CardContent className="space-y-3">{notifications.map((n) => <div key={n.id} className={`rounded-lg border p-4 ${n.isRead ? "bg-white border-[#E7ECF3]" : "bg-[#FFF7ED] border-[#FED7AA]"}`}><div className="flex items-center justify-between"><div className="font-semibold text-[#14213D]">{n.title}</div><Badge variant={n.isRead ? "outline" : "default"}>{n.isRead ? "Read" : "Unread"}</Badge></div><div className="mt-1 text-sm text-[#64748B]">{n.message}</div><div className="mt-1 text-xs text-[#94A3B8]">{new Date(n.createdAt).toLocaleString()} • {n.type}</div></div>)}{!error && notifications.length === 0 && <p className="text-sm text-[#64748B]">No notifications.</p>}</CardContent></Card>
    </div>
  );
}
