import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME, CREATE_TABLES_SQL } from './schema';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let isInitializing = false;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const Database = {
  /**
   * Get the singleton SQLite database instance
   */
  async getDatabaseAsync(): Promise<SQLite.SQLiteDatabase> {
    if (dbInstance) {
      return dbInstance;
    }

    if (initPromise) {
      return initPromise;
    }

    initPromise = this.initDatabaseAsync();
    dbInstance = await initPromise;
    initPromise = null;
    return dbInstance;
  },

  /**
   * Initialize database connection and execute initial schema DDL
   */
  async initDatabaseAsync(): Promise<SQLite.SQLiteDatabase> {
    if (dbInstance) return dbInstance;

    try {
      isInitializing = true;
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

      // Execute schema creation
      await db.execAsync(CREATE_TABLES_SQL);

      dbInstance = db;
      isInitializing = false;
      return db;
    } catch (error) {
      isInitializing = false;
      console.error('[Database] Failed to initialize SQLite database:', error);
      throw error;
    }
  },

  /**
   * Execute callback within a database transaction
   */
  async withTransactionAsync<T>(callback: (db: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
    const db = await this.getDatabaseAsync();
    let result: T;
    await db.withTransactionAsync(async () => {
      result = await callback(db);
    });
    return result!;
  },

  /**
   * Close database connection (used for file replacement during restore)
   */
  async closeDatabaseAsync(): Promise<void> {
    if (dbInstance) {
      try {
        await dbInstance.closeAsync();
      } catch (e) {
        console.warn('[Database] Close error:', e);
      }
      dbInstance = null;
    }
  },

  /**
   * Get raw database name
   */
  getDatabaseName(): string {
    return DATABASE_NAME;
  },
};
