# 📊 AgendaX Complete SQLite Storage Migration & Architecture Report

## Executive Summary
AgendaX has been upgraded from AsyncStorage/JSON persistence to a **100% offline, local SQLite database (`agendax.db`)** paired with a relative-path scoped media storage subsystem, zero-data-loss automated legacy migration, and complete ZIP/JSON backup & restore capabilities.

---

## 1. Project Analysis

### Existing AsyncStorage Keys Identified & Migrated
| Legacy AsyncStorage Key | Description | Target SQLite Table |
|---|---|---|
| `@agendax_workspace_v1` | Root workspace object | Migrated to individual relational tables |
| `@agendax_user_v1` | Local user profile & ID | `users` |
| `@agendax_tasks_v1` | Tasks & reminders | `tasks` |
| `@agendax_events_v1` | Calendar events & schedule | `events` |
| `@agendax_expenses_v1` | Monthly expenses & payment methods | `expenses` |
| `@agendax_urls_v1` | Saved URL bookmarks & notes | `urls` |
| `@agendax_notifications_v1` | Notification records | `notifications` |
| `@agendax_settings_v1` | Theme, haptics & preferences | `settings` |
| `@agendax_security_v1` | PIN lock & biometrics config | `settings` |
| `@agendax_initialized_v1` | Workspace setup flag | `app_migrations` |

### Existing Data Models Preserved
- **LocalUser**: `id`, `name`, `avatarColor`, `createdAt`
- **TaskItem**: `id`, `title`, `description`, `category`, `priority`, `dueDate`, `dueTime`, `url`, `reminderEnabled`, `reminderTime`, `notificationId`, `completed`, `completedAt`, `createdAt`, `updatedAt`
- **EventItem**: `id`, `name`, `description`, `date`, `startTime`, `endTime`, `location`, `url`, `reminderEnabled`, `reminderTime`, `repeat`, `color`, `notificationId`, `createdAt`, `updatedAt`
- **ExpenseItem**: `id`, `title`, `amount`, `category`, `date`, `paymentMethod`, `notes`, `createdAt`, `updatedAt`
- **UrlItem**: `id`, `title`, `url`, `category`, `note`, `createdAt`, `updatedAt`
- **NotificationRecord**: `id`, `title`, `message`, `type`, `referenceId`, `read`, `timestamp`
- **SecuritySettings**: `appLockEnabled`, `lockMode`, `customPin`, `lockedPages`, `biometricsEnabled`
- **AppSettings**: `theme`, `notificationsEnabled`, `hapticFeedback`, `defaultPriority`, `compactView`, `badgeCountEnabled`, `currencySymbol`, `security`

---

## 2. SQLite Database Architecture

### Engine & Library
- **Package**: `expo-sqlite` (~57.0.2)
- **Database File**: `agendax.db` (Local SQLite database located in app scoped documents directory)
- **WAL Mode**: Enabled (`PRAGMA journal_mode = WAL;`) for maximum concurrent read/write throughput.
- **Foreign Keys**: Enabled (`PRAGMA foreign_keys = ON;`).

### Relational Schema
```sql
CREATE TABLE app_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  migration_name TEXT NOT NULL UNIQUE,
  migration_version INTEGER NOT NULL,
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  error_message TEXT
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_color TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  due_date TEXT NOT NULL,
  due_time TEXT,
  url TEXT,
  reminder_enabled INTEGER NOT NULL DEFAULT 0,
  reminder_time TEXT,
  notification_id TEXT,
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  location TEXT,
  url TEXT,
  reminder_enabled INTEGER NOT NULL DEFAULT 0,
  reminder_time TEXT,
  repeat TEXT NOT NULL DEFAULT 'none',
  color TEXT NOT NULL,
  notification_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  payment_method TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

CREATE TABLE urls (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  reference_id TEXT,
  read INTEGER NOT NULL DEFAULT 0,
  timestamp TEXT NOT NULL
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE attachments (
  id TEXT PRIMARY KEY,
  parent_type TEXT NOT NULL,
  parent_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  stored_file_name TEXT NOT NULL,
  relative_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  is_encrypted INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
```

### Repository Pattern
All database operations are encapsulated in strongly-typed repositories:
- `UserRepository`
- `TaskRepository`
- `EventRepository`
- `ExpenseRepository`
- `UrlRepository`
- `NotificationRepository`
- `SettingsRepository`
- `AttachmentRepository`
- `MigrationRepository`

---

## 3. Legacy Migration & Zero Data Loss Guarantee

### Migration Workflow
1. **Startup Check**: On initial app launch, `LegacyMigrationService` checks `app_migrations` for `legacy_asyncstorage_v1`.
2. **Detection**: If already completed, SQLite loads directly. If new install with no AsyncStorage data, migration marks completed.
3. **Safety Snapshot**: If legacy data is detected, a safety JSON dump is saved to `AgendaX/backups/safety_legacy_pre_migration.json`.
4. **Atomic Transaction**: SQLite executes `withTransactionAsync` importing all users, tasks, events, expenses, URLs, notifications, and settings.
5. **Parity Validation**: Compares SQLite row counts against legacy item counts.
6. **Completion**: If counts match 100%, migration is flagged `completed`.
7. **Rollback & Non-Destructive Storage**: If an error occurs, SQLite rolls back changes and AsyncStorage data remains untouched for user recovery.

---

## 4. Media & File Storage Subsystem

### Directory Structure
```
AgendaX/
├── database/
│   └── agendax.db
├── media/
│   ├── images/
│   ├── videos/
│   ├── audio/
│   └── documents/
├── backups/
└── temp/
```
- **Relative Path Design**: Database records only store relative paths (e.g., `media/images/<uuid>.jpg`). `FileStorage.resolveUri()` dynamically resolves paths across app updates and migrations.
- **Media Ingestion**: Selected photos/documents are validated, assigned a cryptographic UUID, copied into the app's scoped sandbox, and indexed in the `attachments` table.
- **Cascade Deletion**: When a task, event, expense, or bookmark is deleted, all related attachments and their physical files are cleanly unlinked and deleted.

---

## 5. Backup & Restore System (JSON & ZIP)

### 1. Standalone JSON Export/Import
- Exports complete offline JSON with version metadata.
- Import includes automatic schema detection and summary preview.

### 2. Full ZIP Archive Backup/Restore (`JSZip`)
- Archives `manifest.json`, `workspace.json`, and database records.
- Restore extracts and verifies files in `AgendaX/temp/` before committing changes.

### 3. Merge vs. Replace Options
- **Merge Data**: Imports non-duplicate items while preserving existing database records.
- **Replace Existing Data**: Atomically wipes and replaces records inside a verified transaction with pre-restore safety snapshots.

---

## 6. Security & Offline Guarantee
- **100% Zero-Backend**: No cloud, no external servers, no network requests.
- **Local Biometrics & PIN Vault**: System biometric authentication and custom PIN verification backed by local SQLite settings.
- **Local Key Derivation & Cryptographic Hashes**: Utilizes `expo-crypto` for UUID generation and cryptographic SHA-256 digests.

---

## 7. Build and Verification Details
- **TypeScript**: `npx tsc --noEmit` passed with 0 errors.
- **APK Target**: Standalone Android Release APK (`agendaX-v1.01.apk`).
