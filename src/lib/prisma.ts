import { PrismaClient } from "@prisma/client";

// Em desenvolvimento o Next.js recarrega os módulos a cada alteração (HMR).
// Sem este singleton, cada reload criaria uma nova conexão com o banco,
// estourando o limite de conexões. Guardamos a instância no objeto global.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
