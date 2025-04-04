
import { checkDatabaseConnection } from './index';

async function testConnection() {
  const result = await checkDatabaseConnection();
  console.log('Database connection test result:', result);
}

testConnection()
  .catch(console.error);
