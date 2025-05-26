// src/db/config.ts
import { Pool, PoolConfig } from 'pg';

/**
 * Database configuration for PostgreSQL using connection string from environment variables.
 * Handles both pooling (POSTGRES_URL) and non-pooling (POSTGRES_URL_NON_POOLING) connections.
 */

// Shared connection options
const connectionOptions: PoolConfig = {
  // Use POSTGRES_URL environment variable for connection string
  connectionString: process.env.POSTGRES_URL,
  // SSL configuration with customization for self-signed certificates
  ssl: process.env.DISABLE_POSTGRES_SSL ? false : {
    rejectUnauthorized: false, // Accept self-signed certificates
  },
};

// Create a connection pool for pooled queries
export const pool = new Pool(connectionOptions);

// Non-pooled connection for direct queries like transactions
// This connection string might have different options
export const getNonPooledClient = async () => {
  const nonPooledConfig: PoolConfig = {
    connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
    ssl: process.env.DISABLE_POSTGRES_SSL ? false : {
      rejectUnauthorized: false, // Accept self-signed certificates
    },
  };
  
  const tempPool = new Pool(nonPooledConfig);
  return tempPool.connect();
};

// Helper function to execute a query using the pool
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  // Log slow queries in development
  if (process.env.NODE_ENV !== 'production' && duration > 100) {
    console.log('Slow query:', { text, duration, rows: res.rowCount });
  }
  
  return res;
}

// Helper function to execute a transaction
export async function transaction<T>(
  callback: (client: any) => Promise<T>,
): Promise<T> {
  const client = await getNonPooledClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// Setup error handling for unexpected pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(1);
});
