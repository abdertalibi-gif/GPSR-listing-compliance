import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="text-6xl font-bold text-[#14213D]">404</div>
      <p className="mt-2 text-slate-600">The page you’re looking for doesn’t exist.</p>
      <Button asChild className="mt-6"><Link href="/">Go home</Link></Button>
    </div>
  );
}
