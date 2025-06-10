import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from 'dotenv';
import * as schema from "@shared/schema";

// Load environment-specific configuration
const environment = process.env.NODE_ENV || 'development';
const envFile = environment === 'test' ? '.env.test' : 
                environment === 'development' ? '.env.development' : 
                '.env';

config({ path: envFile });

if (!process.env.DATABASE_URL) {
  throw new Error(
    `DATABASE_URL must be set in ${envFile}. Did you forget to provision a database?`,
  );
}

// Database connection configuration
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Connection pool settings
  max: environment === 'test' ? 5 : 20, // Fewer connections for tests
  min: environment === 'test' ? 1 : 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(poolConfig);
export const db = drizzle(pool, { 
  schema,
  logger: environment === 'development' ? console : false
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});
