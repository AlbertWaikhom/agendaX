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
      // Version 1 tables are generated in schema.ts CREATE_TABLES_SQL
    },
  },
  {
    version: 2,
    name: 'add_user_avatar_uri',
    up: async (db: SQLiteDatabase) => {
      try {
        await db.execAsync('ALTER TABLE users ADD COLUMN avatar_uri TEXT;');
      } catch (e) {
        // Column may already exist if created on fresh install
      }
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
          await db.execAsync(`PRAGMA user_version = ${migration.version};`);
        }
      }
    } catch (e) {
      console.error('[Migrations] Schema migration error:', e);
    }
  },
};
