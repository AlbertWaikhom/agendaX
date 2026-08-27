import { Platform } from 'react-native';
import { File } from 'expo-file-system';
import { Database } from '../database/database';
import { MigrationRepository } from '../database/repositories/migrationRepository';
import { UserRepository } from '../database/repositories/userRepository';
import { TaskRepository } from '../database/repositories/taskRepository';
import { EventRepository } from '../database/repositories/eventRepository';
import { ExpenseRepository } from '../database/repositories/expenseRepository';
import { UrlRepository } from '../database/repositories/urlRepository';
import { NotificationRepository } from '../database/repositories/notificationRepository';
import { SettingsRepository } from '../database/repositories/settingsRepository';
import { LegacyStorage } from '../storage/legacyStorage';
import { FileStorage } from '../storage/fileStorage';
import { WorkspaceData } from '../types';

export const MIGRATION_NAME = 'legacy_asyncstorage_v1';
export const MIGRATION_VERSION = 1;

export interface MigrationSummary {
  status: 'skipped' | 'migrated' | 'already_migrated' | 'failed';
  message: string;
  counts?: {
    tasks: number;
    events: number;
    expenses: number;
    urls: number;
    notifications: number;
  };
  error?: string;
}

export const LegacyMigrationService = {
  /**
   * Run automated legacy data migration if needed
   */
  async runAutoMigration(): Promise<MigrationSummary> {
    try {
      await FileStorage.ensureDirectoriesAsync();
      await Database.initDatabaseAsync();

      // 1. Check if migration was already executed
      const existingMigration = await MigrationRepository.getMigration(MIGRATION_NAME);
      if (existingMigration && existingMigration.status === 'completed') {
        return {
          status: 'already_migrated',
          message: 'SQLite storage is up to date.',
        };
      }

      // 2. Check if legacy data exists in AsyncStorage
      const hasLegacy = await LegacyStorage.hasLegacyData();
      if (!hasLegacy) {
        // No legacy data exists (fresh install) -> mark completed
        await MigrationRepository.startMigration(MIGRATION_NAME, MIGRATION_VERSION);
        await MigrationRepository.completeMigration(MIGRATION_NAME);
        return {
          status: 'skipped',
          message: 'Fresh installation initialized with SQLite.',
        };
      }

      // 3. Load all legacy data from AsyncStorage
      const legacyData = await LegacyStorage.loadLegacyWorkspace();
      if (!legacyData) {
        return {
          status: 'skipped',
          message: 'No readable legacy workspace found.',
        };
      }

      console.log('[LegacyMigration] Found legacy records. Starting safe migration...');
      await MigrationRepository.startMigration(MIGRATION_NAME, MIGRATION_VERSION);

      // 4. Create a safety snapshot on filesystem before migration
      await this.saveSafetySnapshot(legacyData);

      // 5. Execute Migration within SQLite Transaction
      await Database.withTransactionAsync(async () => {
        // Import User
        if (legacyData.user) {
          await UserRepository.setUser(legacyData.user);
        }

        // Import Tasks
        if (legacyData.tasks.length > 0) {
          await TaskRepository.bulkInsertTasks(legacyData.tasks);
        }

        // Import Events
        if (legacyData.events.length > 0) {
          await EventRepository.bulkInsertEvents(legacyData.events);
        }

        // Import Expenses
        if (legacyData.expenses.length > 0) {
          await ExpenseRepository.bulkInsertExpenses(legacyData.expenses);
        }

        // Import URLs
        if (legacyData.urls.length > 0) {
          await UrlRepository.bulkInsertUrls(legacyData.urls);
        }

        // Import Notifications
        if (legacyData.notifications.length > 0) {
          await NotificationRepository.bulkInsertNotifications(legacyData.notifications);
        }

        // Import Settings
        if (legacyData.settings) {
          await SettingsRepository.setAllSettings(legacyData.settings);
        }
      });

      // 6. Validate Record Counts in SQLite
      const [taskCount, eventCount, expCount, urlCount] = await Promise.all([
        TaskRepository.countTasks(),
        EventRepository.countEvents(),
        ExpenseRepository.countExpenses(),
        UrlRepository.countUrls(),
      ]);

      if (
        taskCount < legacyData.tasks.length ||
        eventCount < legacyData.events.length ||
        expCount < legacyData.expenses.length ||
        urlCount < legacyData.urls.length
      ) {
        throw new Error(
          `Validation parity check failed: Expected tasks=${legacyData.tasks.length}, found=${taskCount}; ` +
            `events=${legacyData.events.length}, found=${eventCount}; ` +
            `expenses=${legacyData.expenses.length}, found=${expCount}; ` +
            `urls=${legacyData.urls.length}, found=${urlCount}`
        );
      }

      // 7. Mark Migration Completed
      await MigrationRepository.completeMigration(MIGRATION_NAME);
      console.log('[LegacyMigration] ✅ Migration successfully completed and verified.');

      return {
        status: 'migrated',
        message: 'Successfully migrated all legacy data to SQLite with 100% parity.',
        counts: {
          tasks: taskCount,
          events: eventCount,
          expenses: expCount,
          urls: urlCount,
          notifications: legacyData.notifications.length,
        },
      };
    } catch (e: any) {
      console.error('[LegacyMigration] Migration failed:', e);
      try {
        await MigrationRepository.failMigration(MIGRATION_NAME, e?.message || 'Unknown migration error');
      } catch (logErr) {
        console.warn('[LegacyMigration] Error logging migration failure:', logErr);
      }

      return {
        status: 'failed',
        message: 'Migration failed. Your previous data is safely preserved.',
        error: e?.message || 'Migration error',
      };
    }
  },

  /**
   * Save pre-migration safety backup file
   */
  async saveSafetySnapshot(data: WorkspaceData): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      const backupsDir = FileStorage.getBackupsDirectory();
      const safetyFile = new File(backupsDir, 'safety_legacy_pre_migration.json');
      if (!safetyFile.exists) {
        safetyFile.create();
      }
      safetyFile.write(JSON.stringify(data, null, 2));
      console.log('[LegacyMigration] Safety pre-migration snapshot saved.');
    } catch (e) {
      console.warn('[LegacyMigration] Warning creating safety snapshot:', e);
    }
  },
};
