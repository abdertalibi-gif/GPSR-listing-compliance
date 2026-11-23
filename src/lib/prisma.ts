import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createMockPrisma(): PrismaClient {
  const noOpModel = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (args?: { data?: Record<string, unknown> }) => ({
      id: "mock-id",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(args?.data ?? {}),
    }),
    update: async (args?: { data?: Record<string, unknown> }) => ({
      id: "mock-id",
      updatedAt: new Date(),
      ...(args?.data ?? {}),
    }),
    upsert: async (args?: {
      create?: Record<string, unknown>;
      update?: Record<string, unknown>;
    }) => ({
      id: "mock-id",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(args?.create ?? args?.update ?? {}),
    }),
    delete: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
    updateMany: async () => ({ count: 0 }),
    count: async () => 0,
    aggregate: async () => ({ _avg: { score: 0 }, _count: 0 }),
  };

  const proxy: PrismaClient = new Proxy(
    {},
    {
      get(_, prop) {
        if (prop === "$transaction") {
          return async (arg: unknown) => {
            if (Array.isArray(arg)) return Promise.all(arg);
            if (typeof arg === "function") return arg(proxy);
            return [];
          };
        }
        if (prop === "$connect" || prop === "$disconnect") {
          return async () => {};
        }
        if (prop === "then") return undefined;
        return noOpModel;
      },
    }
  ) as unknown as PrismaClient;

  return proxy;
}

function initPrisma(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    console.warn("[AI Studio] DATABASE_URL not set — using mock Prisma client");
    return createMockPrisma();
  }
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  } catch {
    console.warn("[AI Studio] Database not connected — using mock Prisma client");
    return createMockPrisma();
  }
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? initPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
