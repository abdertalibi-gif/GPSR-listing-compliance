import Link from "next/link";
import { auth } from "@/lib/auth";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { DashboardNav } from "@/components/layout/dashboard-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isAdmin = (session?.user as unknown as { role?: string })?.role === "ADMIN";
  const userName = session?.user?.name ?? "Super Admin";
  const userEmail = session?.user?.email ?? "super@admin.com";

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FC]">
      <DashboardTopbar userName={userName} userEmail={userEmail} />
      <div className="flex flex-1">
        <aside className="hidden w-[220px] shrink-0 border-r border-[#E7ECF3] bg-white md:flex md:flex-col">
          <DashboardNav isAdmin={isAdmin} />
          <div className="border-t border-[#E7ECF3] p-3">
            <Link href="/login" className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-[#64748B] hover:bg-[#FFF7ED] hover:text-[#EA580C]">
              Sign out
            </Link>
          </div>
        </aside>
        <div className="flex flex-1 flex-col min-w-0">
          <main className="flex-1 p-4 md:p-5 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
