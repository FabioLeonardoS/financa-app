/**
 * Singleton do Prisma Client
 *
 * Em desenvolvimento, o hot-reload do Next.js pode criar múltiplas
 * instâncias do PrismaClient. Este padrão garante que apenas uma
 * instância seja reutilizada durante todo o ciclo de vida do servidor.
 *
 * @see https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
