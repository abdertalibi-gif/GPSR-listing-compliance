import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-bold text-[#14213D]">Contact</h1>
        <Card className="mt-6">
          <CardHeader><CardTitle>Send us a message</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>Name</Label><Input placeholder="Jane Doe" /></div>
              <div><Label>Email</Label><Input placeholder="jane@example.com" autoComplete="email" /></div>
            </div>
            <div><Label>Message</Label><Textarea placeholder="How can we help?" rows={5} /></div>
            <Button>Send message</Button>
            <p className="text-xs text-slate-500">This is a demo form. In production, it posts to /api/contact with rate limiting and validation.</p>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
