import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';
import { sqliteStorage } from './sqliteStorage';

// Nom de la base de données SQLite locale
export const DATABASE_NAME = 'kaly_budget.db';

export function getExpoDatabase() {
  try {
    if (SQLite && typeof SQLite.openDatabaseSync === 'function') {
      return SQLite.openDatabaseSync(DATABASE_NAME);
    }
  } catch (e) {
    console.warn('Expo SQLite native driver not available in current environment, falling back to storage manager', e);
  }
  return null;
}

export const expoDb = getExpoDatabase();
export const db = expoDb ? drizzle(expoDb, { schema }) : null;

// Initialize tables and default seed data
export async function initializeDatabase() {
  sqliteStorage.init();
}
