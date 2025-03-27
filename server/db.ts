import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set. Database functionality will be limited.");
}

try {
  // Only create connection if DATABASE_URL is available
  export const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;
  export const db = pool ? drizzle(pool, { schema }) : null;
} catch (error) {
  console.error('Failed to initialize database connection:', error);
  export const pool = null;
  export const db = null;
}
