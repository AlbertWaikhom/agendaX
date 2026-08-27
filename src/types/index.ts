export type Priority = 'high' | 'medium' | 'low';

export type TaskCategory = 'Work' | 'Personal' | 'Project' | 'Health' | 'Finance' | string;

export type UrlCategory = 'Work' | 'Tools' | 'Personal' | 'Development' | 'Documentation' | 'Design' | string;

export type EventRepeat = 'none' | 'daily' | 'weekly' | 'monthly';

export type ExpenseCategory =
  | 'Housing'
  | 'Food & Dining'
  | 'Transportation'
  | 'Utilities'
  | 'Entertainment'
  | 'Shopping'
  | 'Health'
  | 'Work'
  | 'Personal'
  | 'Other'
  | string;

export type PaymentMethod = 'Card' | 'Cash' | 'Bank Transfer' | 'UPI' | 'Digital Wallet' | 'Other';

export type ThemeMode = 'dark' | 'light' | 'cyber' | 'sunset';

export type AttachmentParentType = 'task' | 'event' | 'expense' | 'url' | 'note';

export interface AttachmentItem {
  id: string;
  parentType: AttachmentParentType;
  parentId: string;
  fileName: string;
  storedFileName: string;
  relativePath: string;
  mimeType: string;
  fileSize: number;
  isEncrypted: boolean;
  createdAt: string;
}

export interface LocalUser {
  id: string; // e.g. "AGX-8F3A2D91"
  name: string;
  avatarColor: string;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm (e.g. "14:30")
  url?: string;
  reminderEnabled: boolean;
  reminderTime?: string; // e.g. "30_min_before", "1_hour_before", "on_time"
  notificationId?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  attachments?: AttachmentItem[];
}

export interface EventItem {
  id: string;
  name: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  location?: string;
  url?: string;
  reminderEnabled: boolean;
  reminderTime?: string;
  repeat: EventRepeat;
  color: string;
  notificationId?: string;
  createdAt: string;
  updatedAt?: string;
  attachments?: AttachmentItem[];
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  attachments?: AttachmentItem[];
}

export interface UrlItem {
  id: string;
  title: string;
  url: string;
  category: UrlCategory;
  note?: string;
  createdAt: string;
  updatedAt?: string;
  attachments?: AttachmentItem[];
}

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'event' | 'system';
  referenceId?: string;
  read: boolean;
  timestamp: string;
}

export type LockMode = 'biometric_system' | 'custom_pin' | 'both';

export interface SecuritySettings {
  appLockEnabled: boolean;
  lockMode: LockMode;
  customPin: string | null; // Stored PIN (4-6 digits)
  lockedPages: string[]; // List of page IDs: 'Settings', 'Expenses', 'Urls', 'Tasks', 'Events'
  biometricsEnabled: boolean;
}

export interface AppSettings {
  theme: ThemeMode;
  notificationsEnabled: boolean;
  hapticFeedback: boolean;
  defaultPriority: Priority;
  compactView: boolean;
  badgeCountEnabled: boolean;
  currencySymbol?: string;
  security?: SecuritySettings;
}

export interface WorkspaceData {
  user: LocalUser | null;
  tasks: TaskItem[];
  events: EventItem[];
  expenses: ExpenseItem[];
  urls: UrlItem[];
  notifications: NotificationRecord[];
  settings: AppSettings;
  attachments?: AttachmentItem[];
}

export interface BackupPayload {
  version: string;
  app: 'AgendaX';
  exportedAt: string;
  workspaceId: string;
  data: WorkspaceData;
}

export interface ZipBackupManifest {
  app: 'AgendaX';
  backupVersion: number;
  createdAt: string;
  database: string;
  mediaDirectory: string;
  recordCounts: {
    tasks: number;
    events: number;
    expenses: number;
    urls: number;
    attachments: number;
  };
}

export interface MigrationRecord {
  id: number;
  migrationName: string;
  migrationVersion: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}
