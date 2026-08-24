import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminUsersPage() {
  let users: Array<{ id: string; email: string; firstName: string; lastName: string; role: string; isActive: boolean; createdAt: Date }> = [];
  try {
    users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 50 }) as never;
  } catch {
    users = [{ id: "u1", email: "demo@example.com", firstName: "Demo", lastName: "User", role: "USER", isActive: true, createdAt: new Date() }];
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#14213D]">Users</h1>
      <Card><CardHeader><CardTitle>All users</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-xs font-semibold text-slate-500"><tr><th className="px-4 py-3 text-left">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Actions</th></tr></thead><tbody>{users.map((u) => <tr key={u.id} className="border-t border-slate-100"><td className="px-4 py-3"><div className="font-medium text-[#14213D]">{u.firstName} {u.lastName}</div><div className="text-xs text-slate-500">{u.email}</div></td><td className="px-4 py-3"><Badge>{u.role}</Badge></td><td className="px-4 py-3"><Badge variant={u.isActive ? "success" : "destructive"}>{u.isActive ? "Active" : "Suspended"}</Badge></td><td className="px-4 py-3 text-slate-600">{new Date(u.createdAt).toLocaleDateString()}</td><td className="px-4 py-3 flex gap-1"><Button size="sm" variant="outline">View</Button><Button size="sm" variant="ghost">{u.isActive ? "Suspend" : "Activate"}</Button></td></tr>)}</tbody></table></div></CardContent></Card>
    </div>
  );
}
