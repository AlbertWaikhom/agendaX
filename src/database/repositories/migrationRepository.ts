import { Database } from '../database';
import { MigrationRecord } from '../../types';

export const MigrationRepository = {
  async getMigration(name: string): Promise<MigrationRecord | null> {
    const db = await Database.getDatabaseAsync();
    const row = await db.getFirstAsync<any>(
      `SELECT id, migration_name, migration_version, status, started_at, completed_at, error_message 
       FROM app_migrations WHERE migration_name = ?`,
      [name]
    );

    if (!row) return null;
    return {
      id: row.id,
      migrationName: row.migration_name,
      migrationVersion: row.migration_version,
      status: row.status,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      errorMessage: row.error_message,
    };
  },

  async startMigration(name: string, version: number): Promise<void> {
    const db = await Database.getDatabaseAsync();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT OR REPLACE INTO app_migrations (migration_name, migration_version, status, started_at, error_message)
       VALUES (?, ?, 'in_progress', ?, NULL)`,
      [name, version, now]
    );
  },

  async completeMigration(name: string): Promise<void> {
    const db = await Database.getDatabaseAsync();
    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE app_migrations SET status = 'completed', completed_at = ?, error_message = NULL 
       WHERE migration_name = ?`,
      [now, name]
    );
  },

  async failMigration(name: string, error: string): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync(
      `UPDATE app_migrations SET status = 'failed', error_message = ? 
       WHERE migration_name = ?`,
      [error, name]
    );
  },
};
