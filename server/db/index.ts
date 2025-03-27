import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../../shared/schema';

const { Pool } = pg;

// Use DATABASE_URL environment variable if available
let connectionString = process.env.DATABASE_URL;

// Otherwise construct from individual parameters
if (!connectionString && process.env.PGHOST) {
  connectionString = `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
}

if (!connectionString) {
  console.warn('Database connection configuration is missing. Please provide DATABASE_URL or individual PG* environment variables.');
}

// Create connection pool if connection string is available
let pool: typeof Pool.prototype | null = null;
if (connectionString) {
  pool = new Pool({
    connectionString,
  });
}

// Export the database instance
export const db = pool ? drizzle(pool, { schema }) : null;

// Export a function to check database connectivity
export async function checkDatabaseConnection() {
  if (!pool) {
    return { success: false, message: 'No database connection string available' };
  }
  
  try {
    // Test query to verify connection
    const result = await pool.query('SELECT NOW()');
    return { success: true, message: 'Database connection successful' };
  } catch (error: any) {
    console.error('Database connection error:', error);
    return { success: false, message: `Database connection failed: ${error.message}` };
  }
}

// Make checkDatabaseConnection available to the server module
export { checkDatabaseConnection as checkConnection };