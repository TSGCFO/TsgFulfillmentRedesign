import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load environment-specific configuration
const environment = process.env.NODE_ENV || 'development';
const envFile = environment === 'test' ? '.env.test' : 
                environment === 'development' ? '.env.development' : 
                '.env';

config({ path: envFile });

if (!process.env.DATABASE_URL) {
  throw new Error(`DATABASE_URL not found in ${envFile}. Ensure the database is provisioned.`);
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: environment === 'development',
  strict: environment !== 'development',
});
