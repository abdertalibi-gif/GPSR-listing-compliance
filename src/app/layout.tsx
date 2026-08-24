import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "GPSR Listing Compliance — Check Your Product Listings for GPSR Requirements",
    template: "%s | GPSR Listing Compliance",
  },
  description:
    "Identify missing product safety and traceability information before publishing products in the European market. Automated GPSR Listing Checks, traceability, and audit-ready reports.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "GPSR Listing Compliance",
    description: "Automated GPSR Listing Checks for EU marketplace sellers.",
    type: "website",
    siteName: "GPSR Listing Compliance",
  },
  twitter: { card: "summary_large_image", title: "GPSR Listing Compliance" },
  icons: { icon: "/favicon.ico" },
  robots: { index: true, follow: true },
};

import { Providers } from "@/components/providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F7F9FC]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
