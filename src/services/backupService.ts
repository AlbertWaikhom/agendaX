import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { WorkspaceData, BackupPayload } from '../types';

export const BackupService = {
  /**
   * Create backup payload from current workspace
   */
  generateBackupPayload(workspace: WorkspaceData): BackupPayload {
    return {
      version: '1.0.0',
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
        // Web export fallback
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        return { success: true, message: 'Backup downloaded successfully!' };
      }

      // Native iOS / Android export with Expo SDK 57 File API
      const file = new File(Paths.cache, fileName);
      if (!file.exists) {
        file.create();
      }
      file.write(jsonString);

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Save AgendaX Backup',
          UTI: 'public.json',
        });
        return { success: true, message: 'Backup file ready to save/share' };
      } else {
        return { success: true, message: `Backup saved to ${file.uri}` };
      }
    } catch (e: any) {
      console.error('[BackupService] Export failed:', e);
      return { success: false, error: e?.message || 'Failed to export backup file' };
    }
  },

  /**
   * Pick and validate a JSON backup file
   */
  async pickAndValidateBackup(): Promise<{
    success: boolean;
    data?: WorkspaceData;
    summary?: { tasksCount: number; eventsCount: number; urlsCount: number; userName: string; exportedAt: string };
    error?: string;
  }> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/json', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { success: false, error: 'File selection cancelled' };
      }

      const fileAsset = result.assets[0];
      let jsonContent = '';

      if (Platform.OS === 'web' && fileAsset.file) {
        jsonContent = await fileAsset.file.text();
      } else if (fileAsset.uri) {
        const file = new File(fileAsset.uri);
        jsonContent = await file.text();
      }

      if (!jsonContent) {
        return { success: false, error: 'Backup file is empty' };
      }

      return this.validateAndParseBackupContent(jsonContent);
    } catch (e: any) {
      console.error('[BackupService] Import picker failed:', e);
      return { success: false, error: e?.message || 'Failed to read backup file' };
    }
  },

  /**
   * Validate JSON schema and parse backup
   */
  validateAndParseBackupContent(jsonString: string): {
    success: boolean;
    data?: WorkspaceData;
    summary?: { tasksCount: number; eventsCount: number; urlsCount: number; userName: string; exportedAt: string };
    error?: string;
  } {
    try {
      const parsed = JSON.parse(jsonString);

      // Check structure
      let workspaceData: WorkspaceData | null = null;
      let exportedAt = '';

      if (parsed.app === 'AgendaX' && parsed.data) {
        workspaceData = parsed.data;
        exportedAt = parsed.exportedAt || 'Unknown date';
      } else if (parsed.user || parsed.tasks || parsed.events) {
        // Direct workspace object fallback
        workspaceData = parsed;
        exportedAt = 'Direct JSON format';
      }

      if (!workspaceData) {
        return { success: false, error: 'Invalid AgendaX backup format' };
      }

      // Ensure array consistency
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
      };

      return {
        success: true,
        data: validatedData,
        summary: {
          tasksCount: validatedData.tasks.length,
          eventsCount: validatedData.events.length,
          urlsCount: validatedData.urls.length,
          userName: validatedData.user?.name || 'Workspace User',
          exportedAt,
        },
      };
    } catch (e) {
      return { success: false, error: 'Corrupted or invalid JSON format' };
    }
  },
};
