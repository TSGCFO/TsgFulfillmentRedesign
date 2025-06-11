import { drizzle } from 'drizzle-kit';
import { Pool } from 'pg'; 
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('render.com') || process.env.DATABASE_URL?.includes('another-secure-host.com') ? {
      rejectUnauthorized: false
    } : { rejectUnauthorized: true },
  },
});