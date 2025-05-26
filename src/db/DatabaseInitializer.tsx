'use client';
// src/db/DatabaseInitializer.tsx

import { useEffect } from 'react';

/**
 * Component that initializes the database on client-side application startup.
 * Makes an API call to trigger database schema creation if needed.
 */
export function DatabaseInitializer() {

  useEffect(() => {
    // Only run in production to avoid development mode double-calls
    if (process.env.NODE_ENV === 'production') {
      initializeDatabase();
    }
  }, []);

  const initializeDatabase = async () => {
    try {
      const response = await fetch('/api/db-init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Database initialization failed:', await response.text());
      }
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  };

  // This component doesn't render anything visible
  return null;
}

export default DatabaseInitializer;
