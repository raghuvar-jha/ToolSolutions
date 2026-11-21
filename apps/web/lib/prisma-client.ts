/**
 * Builds a Prisma client on Neon's serverless driver (spec 012).
 * Used by the app (lib/db.ts) and the seed. Pass the pooled Neon URL
 * (DATABASE_URL, host contains "-pooler"); SSL comes from the URL (sslmode=require).
 * Runs on Node 22+, which has the global WebSocket the driver needs.
 */
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/prisma/client";

export function createPrismaClient(connectionString: string | undefined): PrismaClient {
  if (!connectionString) throw new Error("DATABASE_URL is not set (see .env.example).");
  return new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
}
