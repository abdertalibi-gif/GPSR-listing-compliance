import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function generateReportId() {
  return `RPT-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

export function getScoreLabel(score: number) {
  if (score >= 100) return { label: "Listing Information Complete", color: "bg-emerald-600" };
  if (score >= 80) return { label: "Almost Ready", color: "bg-emerald-500" };
  if (score >= 50) return { label: "Needs Review", color: "bg-amber-500" };
  return { label: "Incomplete", color: "bg-red-500" };
}

export function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "READY": return "default";
    case "NEEDS_REVIEW": return "secondary";
    case "INCOMPLETE": return "destructive";
    case "DRAFT": return "outline";
    case "ARCHIVED": return "outline";
    default: return "outline";
  }
}
