import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-[#14213D]">Privacy Policy</h1>
        <p className="mt-4 text-sm text-slate-600">This is a template privacy policy. Replace with your counsel-approved policy. We outline data collection, storage, retention, and user rights (GDPR).</p>
        <p className="mt-4 text-sm text-slate-600">Authentication is handled via Auth.js with secure sessions. Passwords are hashed with bcrypt. We never log passwords.</p>
      </main>
      <SiteFooter />
    </div>
  );
}
