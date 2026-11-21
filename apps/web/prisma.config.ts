import "dotenv/config";
import { defineConfig } from "prisma/config";

// Neon: the Prisma CLI (migrate, db seed's schema checks) uses the direct, unpooled
// connection (DIRECT_URL). The app and the seed use the pooled DATABASE_URL through
// lib/prisma-client.ts. Both live in apps/web/.env. Never commit real values.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Not env(...): that throws when unset, which would break `prisma generate`
    // on machines without a database. Commands that need a connection report it themselves.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
    // Optional. Only needed when the database user can't create the temporary shadow database.
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
