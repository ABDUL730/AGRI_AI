import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from '../../shared/schema';

// Configure neon to use WebSockets
neonConfig.webSocketConstructor = ws;

// Use DATABASE_URL environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL is not set. Please create a database from the Replit Database tool.');
}

// Create connection pool if connection string is available
let pool: Pool | null = null;
try {
  if (connectionString) {
    // Replace non-pooler with pooler endpoint for better performance
    const poolerUrl = connectionString.replace('.neon.tech', '-pooler.neon.tech');
    pool = new Pool({ 
      connectionString: poolerUrl,
      ssl: {
        rejectUnauthorized: false
      },
      max: 10,
      connectionTimeoutMillis: 5000
    });
  }
} catch (error) {
  console.error('Failed to create database pool:', error);
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