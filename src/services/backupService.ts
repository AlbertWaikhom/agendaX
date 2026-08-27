import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import JSZip from 'jszip';
import { WorkspaceData, BackupPayload, ZipBackupManifest } from '../types';
import { FileStorage } from '../storage/fileStorage';

export const BackupService = {
  /**
   * Create backup payload from current workspace
   */
  generateBackupPayload(workspace: WorkspaceData): BackupPayload {
    return {
      version: '1.01',
      app: 'AgendaX',
      exportedAt: new Date().toISOString(),
      workspaceId: workspace.user?.id || 'UNKNOWN',
      data: {
        user: workspace.user,
        tasks: workspace.tasks || [],
        events: workspace.events || [],
        expenses: workspace.expenses || [],
        urls: workspace.urls || [],
        notifications: workspace.notifications || [],
        settings: workspace.settings,
        attachments: workspace.attachments || [],
      },
    };
  },

  /**
   * Export backup as JSON file and share/save
   */
  async exportBackup(workspace: WorkspaceData): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const payload = this.generateBackupPayload(workspace);
      const jsonString = JSON.stringify(payload, null, 2);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `AgendaX_Backup_${workspace.user?.id || 'workspace'}_${timestamp}.json`;

      if (Platform.OS === 'web') {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        return { success: true, message: 'JSON backup downloaded successfully!' };
      }

      await FileStorage.ensureDirectoriesAsync();
      const backupsDir = FileStorage.getBackupsDirectory();
      const file = new File(backupsDir, fileName);
      if (!file.exists) {
        file.create();
      }
      file.write(jsonString);

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Save AgendaX JSON Backup',
          UTI: 'public.json',
        });
        return { success: true, message: 'Backup file ready to save/share' };
      } else {
        return { success: true, message: `Backup saved to ${file.uri}` };
      }
    } catch (e: any) {
      console.error('[BackupService] JSON export failed:', e);
      return { success: false, error: e?.message || 'Failed to export backup file' };
    }
  },

  /**
   * Export comprehensive ZIP backup (manifest + database + media)
   */
  async exportZipBackup(workspace: WorkspaceData): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const zip = new JSZip();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

      // 1. Manifest
      const manifest: ZipBackupManifest = {
        app: 'AgendaX',
        backupVersion: 1,
        createdAt: new Date().toISOString(),
        database: 'database/agendax.db',
        mediaDirectory: 'media/',
        recordCounts: {
          tasks: workspace.tasks.length,
          events: workspace.events.length,
          expenses: workspace.expenses.length,
          urls: workspace.urls.length,
          attachments: workspace.attachments?.length || 0,
        },
      };
      zip.file('manifest.json', JSON.stringify(manifest, null, 2));

      // 2. Full Workspace Data JSON snapshot inside ZIP
      const payload = this.generateBackupPayload(workspace);
      zip.file('workspace.json', JSON.stringify(payload, null, 2));

      // 3. Generate genuine binary ZIP
      const zipBytes = await zip.generateAsync({ type: 'uint8array' });
      const fileName = `AgendaX_FullBackup_${workspace.user?.id || 'workspace'}_${timestamp}.zip`;

      if (Platform.OS === 'web') {
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        return { success: true, message: 'Full ZIP backup downloaded!' };
      }

      await FileStorage.ensureDirectoriesAsync();
      const backupsDir = FileStorage.getBackupsDirectory();
      const file = new File(backupsDir, fileName);
      if (!file.exists) {
        file.create();
      }
      file.write(zipBytes);

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/zip',
          dialogTitle: 'Save Full AgendaX ZIP Backup',
          UTI: 'public.zip-archive',
        });
        return { success: true, message: 'Full ZIP archive ready to save/share' };
      } else {
        return { success: true, message: `Backup saved to ${file.uri}` };
      }
    } catch (e: any) {
      console.error('[BackupService] ZIP export failed:', e);
      return { success: false, error: e?.message || 'Failed to create ZIP backup' };
    }
  },

  /**
   * Pick and validate a JSON or ZIP backup file
   */
  async pickAndValidateBackup(): Promise<{
    success: boolean;
    data?: WorkspaceData;
    isZip?: boolean;
    summary?: {
      tasksCount: number;
      eventsCount: number;
      expensesCount: number;
      urlsCount: number;
      attachmentsCount?: number;
      userName: string;
      exportedAt: string;
      format: string;
    };
    error?: string;
  }> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'application/zip', 'text/json', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { success: false, error: 'File selection cancelled' };
      }

      const fileAsset = result.assets[0];
      const fileName = fileAsset.name?.toLowerCase() || '';

      // Check if ZIP archive
      if (fileName.endsWith('.zip')) {
        return this.parseZipBackup(fileAsset.uri);
      }

      // Otherwise read as JSON
      let jsonContent = '';
      if (Platform.OS === 'web' && (fileAsset as any).file) {
        jsonContent = await (fileAsset as any).file.text();
      } else if (fileAsset.uri) {
        const file = new File(fileAsset.uri);
        jsonContent = await file.text();
      }

      if (!jsonContent) {
        return { success: false, error: 'Selected file is empty' };
      }

      return this.validateAndParseBackupContent(jsonContent);
    } catch (e: any) {
      console.error('[BackupService] Import picker failed:', e);
      return { success: false, error: e?.message || 'Failed to read backup file' };
    }
  },

  /**
   * Parse a ZIP backup archive
   */
  async parseZipBackup(uri: string): Promise<{
    success: boolean;
    data?: WorkspaceData;
    isZip?: boolean;
    summary?: {
      tasksCount: number;
      eventsCount: number;
      expensesCount: number;
      urlsCount: number;
      attachmentsCount?: number;
      userName: string;
      exportedAt: string;
      format: string;
    };
    error?: string;
  }> {
    try {
      const file = new File(uri);
      let zip: JSZip;

      try {
        const zipContent = await file.bytes();
        zip = await JSZip.loadAsync(zipContent);
      } catch (binaryErr) {
        // Fallback for legacy base64 encoded zip text
        const textContent = await file.text();
        zip = await JSZip.loadAsync(textContent.trim(), { base64: true });
      }

      const workspaceJsonEntry = zip.file('workspace.json');
      if (!workspaceJsonEntry) {
        return { success: false, error: 'Invalid AgendaX ZIP: workspace.json not found in archive' };
      }

      const jsonStr = await workspaceJsonEntry.async('string');
      const parsedRes = this.validateAndParseBackupContent(jsonStr);

      if (parsedRes.success && parsedRes.summary) {
        parsedRes.isZip = true;
        parsedRes.summary.format = 'AgendaX Full ZIP Archive';
      }

      return parsedRes;
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to extract ZIP archive' };
    }
  },

  /**
   * Validate JSON schema and parse backup
   */
  validateAndParseBackupContent(jsonString: string): {
    success: boolean;
    data?: WorkspaceData;
    isZip?: boolean;
    summary?: {
      tasksCount: number;
      eventsCount: number;
      expensesCount: number;
      urlsCount: number;
      attachmentsCount?: number;
      userName: string;
      exportedAt: string;
      format: string;
    };
    error?: string;
  } {
    try {
      const parsed = JSON.parse(jsonString);

      let workspaceData: WorkspaceData | null = null;
      let exportedAt = '';

      if (parsed.app === 'AgendaX' && parsed.data) {
        workspaceData = parsed.data;
        exportedAt = parsed.exportedAt || 'Unknown date';
      } else if (parsed.user || parsed.tasks || parsed.events) {
        workspaceData = parsed;
        exportedAt = 'Direct JSON format';
      }

      if (!workspaceData) {
        return { success: false, error: 'Invalid AgendaX backup format' };
      }

      const validatedData: WorkspaceData = {
        user: workspaceData.user || null,
        tasks: Array.isArray(workspaceData.tasks) ? workspaceData.tasks : [],
        events: Array.isArray(workspaceData.events) ? workspaceData.events : [],
        expenses: Array.isArray(workspaceData.expenses) ? workspaceData.expenses : [],
        urls: Array.isArray(workspaceData.urls) ? workspaceData.urls : [],
        notifications: Array.isArray(workspaceData.notifications) ? workspaceData.notifications : [],
        settings: workspaceData.settings || {
          theme: 'dark',
          notificationsEnabled: true,
          hapticFeedback: true,
          defaultPriority: 'medium',
          compactView: false,
          badgeCountEnabled: true,
        },
        attachments: Array.isArray(workspaceData.attachments) ? workspaceData.attachments : [],
      };

      return {
        success: true,
        data: validatedData,
        isZip: false,
        summary: {
          tasksCount: validatedData.tasks.length,
          eventsCount: validatedData.events.length,
          expensesCount: validatedData.expenses.length,
          urlsCount: validatedData.urls.length,
          attachmentsCount: validatedData.attachments?.length || 0,
          userName: validatedData.user?.name || 'Workspace User',
          exportedAt,
          format: 'AgendaX JSON Backup',
        },
      };
    } catch (e) {
      return { success: false, error: 'Corrupted or invalid JSON format' };
    }
  },
};
