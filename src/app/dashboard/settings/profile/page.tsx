import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LanguageSettings } from "@/components/settings/language-settings";

export default async function ProfilePage() {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  let user: { firstName: string; lastName: string; email: string; company?: string | null; country?: string | null; phone?: string | null } | null = null;
  if (userId) user = await prisma.user.findUnique({ where: { id: userId } }) as never;
  if (!user) user = { firstName: "Demo", lastName: "User", email: "demo@example.com", company: "Acme Ltd", country: "Germany", phone: "+49 30 123456" };

  async function updateProfile(formData: FormData) {
    "use server";
    const session = await auth();
    const uid = (session?.user as unknown as { id?: string })?.id;
    if (!uid) return;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const company = formData.get("company") as string;
    const country = formData.get("country") as string;
    const phone = formData.get("phone") as string;
    await prisma.user.update({ where: { id: uid }, data: { firstName, lastName, name: `${firstName} ${lastName}`, company, country, phone } });
    await prisma.auditLog.create({ data: { userId: uid, action: "PROFILE_UPDATED", entity: "User", entityId: uid } });
    redirect("/dashboard/settings/profile");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-[#14213D]">Profile</h1>
      <LanguageSettings />
      <Card>
        <CardHeader><CardTitle className="text-sm">Personal information</CardTitle></CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>First name</Label><Input name="firstName" defaultValue={user.firstName} /></div>
              <div><Label>Last name</Label><Input name="lastName" defaultValue={user.lastName} /></div>
            </div>
            <div><Label>Email</Label><Input value={user.email} disabled /></div>
            <div><Label>Company</Label><Input name="company" defaultValue={user.company ?? ""} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Country</Label><Input name="country" defaultValue={user.country ?? ""} /></div>
              <div><Label>Phone</Label><Input name="phone" defaultValue={user.phone ?? ""} /></div>
            </div>
            <Button type="submit">Save changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
