export const DATABASE_NAME = 'agendax.db';
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * PRAGMAs must be executed individually with runAsync() — NOT inside execAsync() DDL batches.
 * Mixing PRAGMA journal_mode = WAL with CREATE TABLE causes SQLITE_MISUSE (error 21).
 */
export const PRAGMA_SETUP_SQL: string[] = [
  'PRAGMA journal_mode = WAL;',
  'PRAGMA foreign_keys = ON;',
];

export const CREATE_TABLES_SQL = `
-- 1. App Migrations Tracking
CREATE TABLE IF NOT EXISTS app_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  migration_name TEXT NOT NULL UNIQUE,
  migration_version INTEGER NOT NULL,
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  error_message TEXT
);

-- 2. Local User Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_color TEXT NOT NULL,
  avatar_uri TEXT,
  created_at TEXT NOT NULL
);

-- 3. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
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
  media_uri TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 4. Events Table
CREATE TABLE IF NOT EXISTS events (
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
  image_uri TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

-- 5. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  payment_method TEXT,
  notes TEXT,
  transaction_id TEXT,
  receipt_uri TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

-- 6. URLs Bookmarks Table
CREATE TABLE IF NOT EXISTS urls (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  note TEXT,
  preview_image_uri TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  reference_id TEXT,
  read INTEGER NOT NULL DEFAULT 0,
  timestamp TEXT NOT NULL
);

-- 8. App Settings Key-Value Table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 9. Attachments Table
CREATE TABLE IF NOT EXISTS attachments (
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

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_attachments_parent ON attachments(parent_type, parent_id);
`;
