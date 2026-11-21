/**
 * Prisma client for the app (server only), on the Neon database from DATABASE_URL.
 * Created on first use, so importing this module never needs the variable.
 * One instance is reused across dev hot reloads.
 */
import type { PrismaClient } from "../generated/prisma/client";
import { createPrismaClient } from "./prisma-client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function db(): PrismaClient {
  globalForPrisma.prisma ??= createPrismaClient(process.env.DATABASE_URL);
  return globalForPrisma.prisma;
}
