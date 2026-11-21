/**
 * Prisma client for the app (server only), on the Neon database from DATABASE_URL.
 * Created on first use, so importing this module never needs the variable.
 * One instance is reused across dev hot reloads.
 */
import { PrismaClient } from "../generated/prisma/client";
import { createPrismaClient } from "./prisma-client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  /** The generated class the cached client was built from. */
  prismaClass?: typeof PrismaClient;
};

export function db(): PrismaClient {
  // After `prisma generate` (new models), dev hot reload loads a new PrismaClient class
  // while globalThis still holds the old instance, which lacks the new models.
  // Rebuild the client when the class changes.
  if (!globalForPrisma.prisma || globalForPrisma.prismaClass !== PrismaClient) {
    void globalForPrisma.prisma?.$disconnect();
    globalForPrisma.prisma = createPrismaClient(process.env.DATABASE_URL);
    globalForPrisma.prismaClass = PrismaClient;
  }
  return globalForPrisma.prisma;
}
