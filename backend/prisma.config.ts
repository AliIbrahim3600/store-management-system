import { defineConfig } from "@prisma/config";
import "dotenv/config";

// Declare minimal process env shape to avoid TS error when @types/node is not installed
declare const process: { env: { DATABASE_URL?: string } };

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
