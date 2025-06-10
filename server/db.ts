import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure SSL for external databases like Render
const isExternalDB = process.env.DATABASE_URL?.includes('render.com') || 
                    process.env.DATABASE_URL?.includes('neon.tech') ||
                    process.env.DATABASE_URL?.includes('supabase.co');

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: isExternalDB ? {
    rejectUnauthorized: false
  } : false
});
export const db = drizzle(pool, { schema });
