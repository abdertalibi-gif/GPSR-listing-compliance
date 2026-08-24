"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ClipboardCheck, FileText, Folder, Bell, Settings, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

const iconMap = {
  dashboard: LayoutDashboard,
  products: Package,
  checks: ClipboardCheck,
  reports: FileText,
  documents: Folder,
  notifications: Bell,
  settings: Settings,
  admin: Users,
};

export function DashboardNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const { t } = useI18n();

  const navPrincipal = [
    { href: "/dashboard", label: t("sidebar.dashboard"), icon: iconMap.dashboard, key: "dashboard" },
    { href: "/dashboard/products", label: t("sidebar.products"), icon: iconMap.products, key: "products" },
    { href: "/dashboard/checks", label: t("sidebar.checks"), icon: iconMap.checks, key: "checks" },
    { href: "/dashboard/reports", label: t("sidebar.reports"), icon: iconMap.reports, key: "reports" },
    { href: "/dashboard/documents", label: t("sidebar.documents"), icon: iconMap.documents, key: "documents" },
  ];
  const navMonitoring = [
    { href: "/dashboard/notifications", label: t("sidebar.notifications"), icon: iconMap.notifications, key: "notifications" },
  ];
  const navConfig = [
    { href: "/dashboard/settings/profile", label: t("sidebar.settings"), icon: iconMap.settings, key: "settings" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: iconMap.admin, key: "admin" }] : []),
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const NavItem = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors ${active ? "bg-[#FFF7ED] text-[#EA580C]" : "text-[#334155] hover:bg-[#FFF7ED] hover:text-[#EA580C]"}`}
      >
        <Icon className="h-4 w-4 shrink-0" /> {label}
      </Link>
    );
  };

  return (
    <nav className="flex-1 space-y-5 p-3">
      <div>
        <div className="mb-1.5 px-2 text-[10px] font-semibold tracking-widest text-[#94A3B8]">{t("sidebar.principal")}</div>
        <div className="space-y-0.5">
          {navPrincipal.map((item) => (
            <NavItem key={item.key} href={item.href} label={item.label} icon={item.icon} />
          ))}
        </div>
      </div>
      <div>
        <div className="mb-1.5 px-2 text-[10px] font-semibold tracking-widest text-[#94A3B8]">{t("sidebar.monitoring")}</div>
        <div className="space-y-0.5">
          {navMonitoring.map((item) => (
            <NavItem key={item.key} href={item.href} label={item.label} icon={item.icon} />
          ))}
        </div>
      </div>
      <div>
        <div className="mb-1.5 px-2 text-[10px] font-semibold tracking-widest text-[#94A3B8]">{t("sidebar.configuration")}</div>
        <div className="space-y-0.5">
          {navConfig.map((item) => (
            <NavItem key={item.key} href={item.href} label={item.label} icon={item.icon} />
          ))}
        </div>
      </div>
    </nav>
  );
}
