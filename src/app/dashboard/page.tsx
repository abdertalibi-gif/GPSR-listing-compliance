import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  const userName = session?.user?.name ?? "Super Admin";

  let stats = { total: 12, compliant: 4, needsReview: 3, critical: 2, checks: 27, reports: 8, documents: 14, avgScore: 82, incomplete: 5 };
  let recentProducts: Array<{ id: string; name: string; sku: string; status: string; score: number }> = [
    { id: "demo1", name: "Wireless Bluetooth Headphones", sku: "WH-XB900", status: "READY", score: 92 },
    { id: "demo2", name: "Stainless Steel Water Bottle 500ml", sku: "SS-WB500", status: "NEEDS_REVIEW", score: 72 },
    { id: "demo3", name: "Kids Building Blocks (CE)", sku: "KB-200", status: "INCOMPLETE", score: 34 },
  ];
  let recentChecks: Array<{ id: string; productName: string; score: number; status: string; createdAt: Date }> = [];

  if (userId) {
    try {
      const [total, compliant, needsReview, criticalProducts, checks, reports, documents, avgAgg, recentProds, checksRecent] = await Promise.all([
        prisma.product.count({ where: { userId, deletedAt: null } }),
        prisma.product.count({ where: { userId, status: "READY" } }),
        prisma.product.count({ where: { userId, status: "NEEDS_REVIEW" } }),
        prisma.product.count({ where: { userId, status: "INCOMPLETE" } }),
        prisma.gpsrCheck.count({ where: { userId } }),
        prisma.complianceReport.count({ where: { userId } }),
        prisma.productDocument.count({ where: { product: { userId } } }),
        prisma.product.aggregate({ where: { userId, deletedAt: null }, _avg: { score: true } }),
        prisma.product.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 5 }),
        prisma.gpsrCheck.findMany({ where: { userId }, include: { product: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 5 }),
      ]);
      stats = {
        total,
        compliant,
        needsReview,
        critical: criticalProducts,
        checks,
        reports,
        documents,
        avgScore: Math.round(avgAgg._avg.score ?? 0),
        incomplete: criticalProducts,
      };
      recentProducts = recentProds as never;
      recentChecks = checksRecent.map((c) => ({ id: c.id, productName: (c.product as unknown as { name: string }).name, score: c.score, status: c.status, createdAt: c.createdAt }));
    } catch {}
  }

  return <DashboardContent stats={stats} recentProducts={recentProducts} recentChecks={recentChecks} userName={userName} />;
}
