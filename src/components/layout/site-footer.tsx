import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-[#14213D] text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck className="h-5 w-5 text-[#EA580C]" />
              <span className="font-bold">GPSR Listing Compliance</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Automated listing information checks for EU GPSR requirements. Identify missing traceability and safety
              information before publishing.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Product</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/features" className="hover:text-white">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
              <li><Link href="/disclaimer" className="hover:text-white">Disclaimer</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Disclaimer</h4>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              This platform provides automated listing information checks and compliance support. It does not constitute
              legal advice, product certification, safety certification, or a guarantee of compliance with EU law.
            </p>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-slate-400">
          © {new Date().getFullYear()} GPSR Listing Compliance. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
