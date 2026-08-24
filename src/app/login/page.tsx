"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function LoginPage() {
  const { t, dir } = useI18n();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "", rememberMe: false } });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    const res = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    if (res?.error) setError(t("auth.login") + " failed");
    else router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FC] px-6 py-8" dir={dir}>
      <div className="mx-auto mb-4">
        <LanguageSwitcher />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md border-[#E7ECF3]">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[#EA580C] text-white"><ShieldCheck className="h-5 w-5" /></div>
            <CardTitle className="mt-2">{t("auth.login")}</CardTitle>
            <CardDescription>{t("auth.login")} — GPSR Compliance</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-4 rounded-md bg-[#FEF2F2] border border-[#FECACA] p-3 text-sm text-[#EF4444]">{error}</div>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div><Label>{t("auth.email")}</Label><Input type="email" {...register("email")} autoComplete="email" placeholder="you@example.com" />{errors.email && <p className="text-xs text-[#EF4444]">{errors.email.message}</p>}</div>
              <div><Label>{t("auth.password")}</Label><Input type="password" {...register("password")} autoComplete="current-password" />{errors.password && <p className="text-xs text-[#EF4444]">{errors.password.message}</p>}</div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" {...register("rememberMe")} /> {t("common.loading") === "Loading..." ? "Remember me" : t("auth.login")}</label>
                <Link href="/forgot-password" className="text-[#EA580C] underline">{t("auth.forgot")}</Link>
              </div>
              <Button type="submit" className="w-full bg-[#EA580C] hover:bg-[#C2410C]" disabled={isSubmitting}>{isSubmitting ? t("common.loading") : t("auth.signin")}</Button>
            </form>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>Google</Button>
              <Button variant="outline" onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })}>Facebook</Button>
            </div>
            <p className="mt-4 text-center text-sm text-[#64748B]">{t("auth.noAccount")} <Link href="/register" className="font-medium text-[#EA580C] underline">{t("auth.signup")}</Link></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
