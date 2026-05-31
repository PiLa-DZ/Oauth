import env from "./src/lib/env.schema.js";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx ./prisma/seed.ts",
    path: "prisma/migrations",
  },
  datasource: {
    url: env.DATABASE_URL,
  },
});
