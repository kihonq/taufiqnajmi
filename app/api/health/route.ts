import { NextResponse } from 'next/server';
import pkg from '@/../package.json';
import { Pool } from 'pg';

/**
 * Health check endpoint for Coolify and monitoring services
 * Returns basic application information and status, including 
 * database connectivity status
 */
export async function GET() {
  let dbStatus = 'unknown';
  let dbLatency = null;
  const dbStartTime = Date.now();
  
  // Check database connectivity
  if (process.env.POSTGRES_URL) {
    try {
      const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: process.env.DISABLE_POSTGRES_SSL ? false : undefined,
        // Shorter timeout for health checks
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 5000,
      });
      
      // Test database connection with a simple query
      const client = await pool.connect();
      try {
        await client.query('SELECT 1');
        dbStatus = 'connected';
        dbLatency = Date.now() - dbStartTime;
      } finally {
        client.release();
      }
      await pool.end();
    } catch (error) {
      console.error('Database health check failed:', error);
      dbStatus = 'error';
    }
  } else {
    dbStatus = 'not_configured';
  }
  
  // Basic health information
  const health = {
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    version: 'unknown',
    name: pkg.name,
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      latency: dbLatency,
    },
  };
  
  // Return health information with appropriate status code
  return NextResponse.json(health, { 
    status: dbStatus === 'connected' ? 200 : 503,
  });
}
