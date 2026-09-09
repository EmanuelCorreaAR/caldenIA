import path from "node:path";
import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Forzar .env del repo (pisa variables viejas del shell, p.ej. johndoe/mydb)
config({ path: path.join(__dirname, ".env"), override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
