import Link from "next/link";
import { ShieldCheck } from "lucide-react";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F7F9FC]">
      <aside className="w-60 border-r border-[#1E293B] bg-[#14213D] flex flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-[#1E293B] px-5"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EA580C] text-white"><ShieldCheck className="h-4 w-4" /></div><span className="text-sm font-bold text-white">Admin</span></div>
        <nav className="space-y-1 p-3 text-sm flex-1">
          <Link href="/admin" className="block rounded-md px-3 py-2 text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white">Dashboard</Link>
          <Link href="/admin/users" className="block rounded-md px-3 py-2 text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white">Users</Link>
          <Link href="/dashboard/products" className="block rounded-md px-3 py-2 text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white">Products</Link>
          <Link href="/dashboard/checks" className="block rounded-md px-3 py-2 text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white">GPSR Checks</Link>
          <Link href="/admin/settings" className="block rounded-md px-3 py-2 text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white">Settings</Link>
          <Link href="/dashboard" className="block rounded-md px-3 py-2 text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white">Back to Dashboard</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-[#F7F9FC]">{children}</main>
    </div>
  );
}
