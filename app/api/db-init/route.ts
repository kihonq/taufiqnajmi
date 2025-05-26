// app/api/db-init/route.ts
import { NextResponse } from 'next/server';
import { setupDatabase } from '@/db/setup';

/**
 * API endpoint that initializes the database schema.
 * This is called during application startup to ensure database is properly set up.
 */
export async function POST() {
  try {
    const success = await setupDatabase();
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database initialized successfully',
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Database initialization failed',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Database initialization error',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
