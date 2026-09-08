import { SQLiteDatabase } from 'expo-sqlite';
import { CURRENT_SCHEMA_VERSION } from './schema';

export interface SchemaMigration {
  version: number;
  name: string;
  up: (db: SQLiteDatabase) => Promise<void>;
}

export const SCHEMA_MIGRATIONS: SchemaMigration[] = [
  {
    version: 1,
    name: 'initial_schema_v1',
    up: async (_db: SQLiteDatabase) => {
    },
  },
  {
    version: 2,
    name: 'add_user_avatar_uri',
    up: async (db: SQLiteDatabase) => {
      try {
        await db.execAsync('ALTER TABLE users ADD COLUMN avatar_uri TEXT;');
      } catch (e) {
        // Column may already exist
      }
    },
  },
  {
    version: 3,
    name: 'add_media_and_transaction_fields',
    up: async (db: SQLiteDatabase) => {
      try {
        await db.execAsync('ALTER TABLE tasks ADD COLUMN media_uri TEXT;');
      } catch { }
      try {
        await db.execAsync('ALTER TABLE events ADD COLUMN image_uri TEXT;');
      } catch { }
      try {
        await db.execAsync('ALTER TABLE expenses ADD COLUMN transaction_id TEXT;');
      } catch { }
      try {
        await db.execAsync('ALTER TABLE expenses ADD COLUMN receipt_uri TEXT;');
      } catch { }
      try {
        await db.execAsync('ALTER TABLE urls ADD COLUMN preview_image_uri TEXT;');
      } catch { }
    },
  },
  {
    version: 4,
    name: 'create_notes_table',
    up: async (db: SQLiteDatabase) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS notes (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          category TEXT NOT NULL DEFAULT 'General',
          color TEXT,
          pinned INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(pinned);
        CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at);
      `);
    },
  },
];

export const Migrations = {
  async runSchemaMigrations(db: SQLiteDatabase): Promise<void> {
    try {
      const userVersionResult = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
      const currentVersion = userVersionResult?.user_version || 0;

      for (const migration of SCHEMA_MIGRATIONS) {
        if (migration.version > currentVersion) {
          console.log(`[Migrations] Applying schema migration v${migration.version}: ${migration.name}`);
          await migration.up(db);
          // PRAGMA must use runAsync, NOT execAsync to avoid SQLITE_MISUSE
          await db.runAsync(`PRAGMA user_version = ${migration.version};`);
        }
      }
    } catch (e) {
      console.error('[Migrations] Schema migration error:', e);
    }
  },
};
