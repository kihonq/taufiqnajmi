// src/db/setup.ts
import { query, transaction } from './config';

/**
 * Database setup script that creates the necessary tables if they don't exist.
 * This should be run on application startup to ensure the database is properly configured.
 */

export async function setupDatabase() {
  console.log('Checking database schema...');
  
  try {
    // Check if tables exist by querying the information_schema
    const tablesExist = await checkTablesExist();
    
    if (tablesExist) {
      console.log('Database schema already exists.');
      return true;
    }
    
    console.log('Creating database schema...');
    await createSchema();
    console.log('Database schema created successfully.');
    return true;
  } catch (error) {
    console.error('Failed to setup database:', error);
    return false;
  }
}

async function checkTablesExist() {
  const tables = ['photos', 'tags', 'photo_tags'];
  const tableCheck = await query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = ANY($1)
  `, [tables]);
  
  return tableCheck.rowCount === tables.length;
}

async function createSchema() {
  // Using a transaction to ensure all tables are created or none at all
  return transaction(async (client) => {
    // NOTE: This is a simplified schema creation.
    // In a real application, you would use a migration tool like Prisma.
    
    // Photos table
    await client.query(`
      CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY,
        title TEXT,
        caption TEXT,
        taken_at TIMESTAMP WITH TIME ZONE,
        width INTEGER,
        height INTEGER,
        aspect_ratio REAL,
        blur_data TEXT,
        make TEXT,
        model TEXT,
        focal_length TEXT,
        focal_length_in_35mm TEXT,
        f_number REAL,
        iso INTEGER,
        exposure_time TEXT,
        latitude REAL,
        longitude REAL,
        film_simulation TEXT,
        hidden BOOLEAN DEFAULT false,
        priority INTEGER DEFAULT 0,
        image_path TEXT NOT NULL,
        thumbnail_path TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Tags table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Photo-tags join table
    await client.query(`
      CREATE TABLE IF NOT EXISTS photo_tags (
        photo_id TEXT REFERENCES photos(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (photo_id, tag_id)
      )
    `);
    
    // Create indexes for faster queries
    await client.query('CREATE INDEX IF NOT EXISTS idx_photos_taken_at ON photos(taken_at)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_photos_make ON photos(make)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_photos_hidden ON photos(hidden)');
  });
}
