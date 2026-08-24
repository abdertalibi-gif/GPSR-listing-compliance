"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { registerAction } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    const res = await registerAction(data);
    if (res?.error) setServerError(res.error);
    else {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[#14213D] text-white"><ShieldCheck className="h-5 w-5" /></div>
          <CardTitle className="mt-2">Create account</CardTitle>
          <CardDescription>Start your GPSR Listing Check — no credit card required</CardDescription>
        </CardHeader>
        <CardContent>
          {success && <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">Account created. Redirecting to login…</div>}
          {serverError && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{serverError}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>First name</Label><Input {...register("firstName")} autoComplete="given-name" />{errors.firstName && <p className="text-xs text-red-600">{errors.firstName.message}</p>}</div>
              <div><Label>Last name</Label><Input {...register("lastName")} autoComplete="family-name" />{errors.lastName && <p className="text-xs text-red-600">{errors.lastName.message}</p>}</div>
            </div>
            <div><Label>Email</Label><Input type="email" {...register("email")} autoComplete="email" />{errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}</div>
            <div><Label>Password</Label><Input type="password" {...register("password")} autoComplete="new-password" />{errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}</div>
            <div><Label>Confirm password</Label><Input type="password" {...register("confirmPassword")} autoComplete="new-password" />{errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>}</div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("acceptTerms")} /> I accept the <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy</Link></label>
            {errors.acceptTerms && <p className="text-xs text-red-600">{errors.acceptTerms.message}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create account"}</Button>
          </form>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => alert("Google OAuth requires GOOGLE_CLIENT_ID env — configured in Auth.js")}>&nbsp;Google</Button>
            <Button variant="outline" onClick={() => alert("Facebook OAuth requires FACEBOOK_CLIENT_ID env")}>Facebook</Button>
          </div>
          <p className="mt-4 text-center text-sm text-slate-600">Already have an account? <Link href="/login" className="font-medium text-[#14213D] underline">Login</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}
