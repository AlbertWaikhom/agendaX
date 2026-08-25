import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useWorkspace } from '../../context/WorkspaceContext';
import { BackupService } from '../../services/backupService';
import { WorkspaceData } from '../../types';
import { ModalWrapper } from '../../components/common/ModalWrapper';
import { Button } from '../../components/common/Button';

interface BackupRestoreModalProps {
  visible: boolean;
  onClose: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  visible,
  onClose,
}) => {
  const { exportData, importData } = useWorkspace();
  const [loadingExport, setLoadingExport] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Import state
  const [parsedData, setParsedData] = useState<WorkspaceData | null>(null);
  const [previewSummary, setPreviewSummary] = useState<{
    tasksCount: number;
    eventsCount: number;
    urlsCount: number;
    userName: string;
    exportedAt: string;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = async () => {
    setLoadingExport(true);
    setExportMessage(null);
    try {
      const result = await exportData();
      if (result.success) {
        setExportMessage(result.message || 'Backup file generated successfully!');
      } else {
        setExportMessage(result.error || 'Failed to generate backup');
      }
    } catch (e: any) {
      setExportMessage(e?.message || 'Export error');
    } finally {
      setLoadingExport(false);
    }
  };

  const handlePickFile = async () => {
    setLoadingImport(true);
    setImportError(null);
    setParsedData(null);
    setPreviewSummary(null);

    try {
      const res = await BackupService.pickAndValidateBackup();
      if (!res.success || !res.data) {
        if (res.error !== 'File selection cancelled') {
          setImportError(res.error || 'Could not validate backup file');
        }
        return;
      }

      setParsedData(res.data);
      setPreviewSummary(res.summary || null);
    } catch (e: any) {
      setImportError(e?.message || 'Error reading file');
    } finally {
      setLoadingImport(false);
    }
  };

  const handleConfirmRestore = async () => {
    if (!parsedData) return;

    Alert.alert(
      '⚠️ Restore Workspace Backup',
      'This action will replace your current workspace data with the selected backup file. Are you sure you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore Now',
          style: 'destructive',
          onPress: async () => {
            setLoadingImport(true);
            const ok = await importData(parsedData);
            setLoadingImport(false);
            if (ok) {
              Alert.alert('✅ Restored Successfully', 'Your workspace has been fully restored.');
              onClose();
            } else {
              setImportError('Failed to restore data into local storage.');
            }
          },
        },
      ]
    );
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title="Backup & Restore"
      subtitle="Export or import your complete local workspace JSON file"
    >
      {/* Export Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconCircle, { backgroundColor: `${Colors.primary}20` }]}>
            <Ionicons name="cloud-upload-outline" size={22} color={Colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.sectionTitle}>Export Workspace JSON</Text>
            <Text style={styles.sectionDesc}>
              Save all your tasks, events, URLs, and settings into a standard offline JSON backup file.
            </Text>
          </View>
        </View>

        <Button
          title="Export Backup File"
          icon="download-outline"
          loading={loadingExport}
          onPress={handleExport}
          style={{ marginTop: Spacing.md }}
        />

        {exportMessage && (
          <View style={styles.messageBox}>
            <Ionicons name="checkmark-circle-outline" size={16} color={Colors.success} />
            <Text style={styles.messageText}>{exportMessage}</Text>
          </View>
        )}
      </View>

      {/* Import Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconCircle, { backgroundColor: `${Colors.accentPurple}20` }]}>
            <Ionicons name="cloud-download-outline" size={22} color={Colors.accentPurple} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.sectionTitle}>Import & Restore JSON</Text>
            <Text style={styles.sectionDesc}>
              Load an existing AgendaX JSON backup file to restore your workspace.
            </Text>
          </View>
        </View>

        <Button
          title="Select Backup File"
          variant="secondary"
          icon="document-text-outline"
          loading={loadingImport}
          onPress={handlePickFile}
          style={{ marginTop: Spacing.md }}
        />

        {importError && (
          <View style={[styles.messageBox, { backgroundColor: Colors.errorBg, borderColor: Colors.error }]}>
            <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
            <Text style={[styles.messageText, { color: Colors.error }]}>{importError}</Text>
          </View>
        )}

        {/* Backup Summary Preview */}
        {previewSummary && (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Backup File Summary</Text>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Owner:</Text>
              <Text style={styles.previewVal}>{previewSummary.userName}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Tasks:</Text>
              <Text style={styles.previewVal}>{previewSummary.tasksCount} tasks</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Events:</Text>
              <Text style={styles.previewVal}>{previewSummary.eventsCount} events</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>URLs:</Text>
              <Text style={styles.previewVal}>{previewSummary.urlsCount} bookmarks</Text>
            </View>

            <Button
              title="Confirm & Restore Workspace"
              variant="danger"
              icon="refresh"
              onPress={handleConfirmRestore}
              style={{ marginTop: Spacing.md }}
            />
          </View>
        )}
      </View>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  sectionDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 17,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successBg,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  messageText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.success,
    marginLeft: 6,
    flex: 1,
  },
  previewCard: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  previewTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryLight,
    marginBottom: 8,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  previewLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  previewVal: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
});
