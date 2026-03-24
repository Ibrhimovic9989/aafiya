import { config } from "dotenv";
import path from "node:path";
import { defineConfig } from "prisma/config";

// Load .env.local (Next.js convention) instead of .env
config({ path: path.join(__dirname, ".env.local") });

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  migrations: {
    path: path.join(__dirname, "prisma", "migrations"),
  },
  datasource: {
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"]!,
  },
});
