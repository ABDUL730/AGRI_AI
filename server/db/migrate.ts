import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { log } from '../vite';

// Connection string from environment variables
let connectionString = process.env.DATABASE_URL;

// Otherwise construct from individual parameters
if (!connectionString && process.env.PGHOST) {
  connectionString = `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
}

if (!connectionString) {
  console.error('Database connection configuration is missing. Please provide DATABASE_URL or individual PG* environment variables.');
  process.exit(1);
}

// Create a pool
const pool = new Pool({
  connectionString,
});

// Create drizzle instance
const db = drizzle(pool);

// Run migrations
async function main() {
  log('Running migrations...', 'migrate');
  
  try {
    await migrate(db, { migrationsFolder: 'drizzle' });
    log('Migrations completed successfully', 'migrate');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  await pool.end();
}

// Run main function
main();