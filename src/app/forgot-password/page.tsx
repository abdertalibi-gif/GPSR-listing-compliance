import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <div className="mx-auto max-w-md px-6 py-12">
        <Card>
          <CardHeader><CardTitle>Forgot password</CardTitle><CardDescription>Enter your email to receive a secure reset link (expires in 1 hour).</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Email</Label><Input type="email" placeholder="you@example.com" autoComplete="email" /></div>
            <Button className="w-full">Send reset link</Button>
            <p className="text-xs text-slate-500">Reset tokens are hashed and expire. Check server logs for the mock email in development.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
