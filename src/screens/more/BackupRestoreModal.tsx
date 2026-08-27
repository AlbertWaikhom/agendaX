import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
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
  const { colors } = useTheme();
  const { exportData, exportZipData, importMergeData, importReplaceData } = useWorkspace();
  const [loadingExport, setLoadingExport] = useState(false);
  const [loadingZipExport, setLoadingZipExport] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Import state
  const [parsedData, setParsedData] = useState<WorkspaceData | null>(null);
  const [previewSummary, setPreviewSummary] = useState<{
    tasksCount: number;
    eventsCount: number;
    expensesCount: number;
    urlsCount: number;
    attachmentsCount?: number;
    userName: string;
    exportedAt: string;
    format: string;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  const handleExportJson = async () => {
    setLoadingExport(true);
    setExportMessage(null);
    try {
      const result = await exportData();
      if (result.success) {
        setExportMessage(result.message || 'JSON backup generated successfully!');
      } else {
        setExportMessage(result.error || 'Failed to generate backup');
      }
    } catch (e: any) {
      setExportMessage(e?.message || 'Export error');
    } finally {
      setLoadingExport(false);
    }
  };

  const handleExportZip = async () => {
    setLoadingZipExport(true);
    setExportMessage(null);
    try {
      const result = await exportZipData();
      if (result.success) {
        setExportMessage(result.message || 'Full ZIP backup archive created successfully!');
      } else {
        setExportMessage(result.error || 'Failed to generate ZIP backup');
      }
    } catch (e: any) {
      setExportMessage(e?.message || 'ZIP Export error');
    } finally {
      setLoadingZipExport(false);
    }
  };

  const handlePickFile = async () => {
    setLoadingImport(true);
    setImportError(null);
    setImportSuccessMessage(null);
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

  const handleMergeRestore = async () => {
    if (!parsedData) return;
    setLoadingImport(true);
    setImportError(null);
    try {
      const res = await importMergeData(parsedData);
      if (res.success) {
        Alert.alert(
          '✅ Merge Complete',
          `Imported: ${res.imported.tasks} tasks, ${res.imported.events} events, ${res.imported.expenses} expenses, ${res.imported.urls} URLs.\nSkipped ${res.skippedDuplicates || 0} existing duplicates.`
        );
        onClose();
      } else {
        setImportError(res.error || 'Failed to merge data.');
      }
    } catch (e: any) {
      setImportError(e?.message || 'Merge failed');
    } finally {
      setLoadingImport(false);
    }
  };

  const handleReplaceRestore = async () => {
    if (!parsedData) return;

    Alert.alert(
      '⚠️ Replace All Workspace Data',
      'This action will replace all current SQLite tasks, events, and expenses with the backup data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Replace All Now',
          style: 'destructive',
          onPress: async () => {
            setLoadingImport(true);
            setImportError(null);
            try {
              const res = await importReplaceData(parsedData);
              if (res.success) {
                Alert.alert('✅ Restored Successfully', 'Your workspace has been completely restored from backup.');
                onClose();
              } else {
                setImportError(res.error || 'Failed to replace data in SQLite.');
              }
            } catch (e: any) {
              setImportError(e?.message || 'Restore error');
            } finally {
              setLoadingImport(false);
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
      title="Backup & Restore Vault"
      subtitle="100% Offline SQLite export & import (JSON or ZIP Archive)"
    >
      {/* Export Section */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}20` }]}>
            <Ionicons name="cloud-upload-outline" size={22} color={colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Export SQLite Backup</Text>
            <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
              Save your complete workspace into an offline JSON file or full ZIP archive with media.
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: Spacing.md }}>
          <Button
            title="Export JSON"
            icon="document-text-outline"
            loading={loadingExport}
            onPress={handleExportJson}
            style={{ flex: 1 }}
          />
          <Button
            title="Export ZIP"
            icon="archive-outline"
            variant="secondary"
            loading={loadingZipExport}
            onPress={handleExportZip}
            style={{ flex: 1 }}
          />
        </View>

        {exportMessage && (
          <View style={[styles.messageBox, { backgroundColor: colors.successBg, borderColor: colors.success }]}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
            <Text style={[styles.messageText, { color: colors.success }]}>{exportMessage}</Text>
          </View>
        )}
      </View>

      {/* Import Section */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconCircle, { backgroundColor: `${colors.accentPurple}20` }]}>
            <Ionicons name="cloud-download-outline" size={22} color={colors.accentPurple} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Import & Restore Backup</Text>
            <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
              Select any AgendaX JSON or ZIP archive to merge or restore into your SQLite database.
            </Text>
          </View>
        </View>

        <Button
          title="Select Backup (JSON / ZIP)"
          variant="secondary"
          icon="folder-open-outline"
          loading={loadingImport}
          onPress={handlePickFile}
          style={{ marginTop: Spacing.md }}
        />

        {importError && (
          <View style={[styles.messageBox, { backgroundColor: colors.errorBg, borderColor: colors.error }]}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
            <Text style={[styles.messageText, { color: colors.error }]}>{importError}</Text>
          </View>
        )}

        {/* Backup Summary Preview */}
        {previewSummary && (
          <View style={[styles.previewCard, { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderLight }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={[styles.previewTitle, { color: colors.primaryLight }]}>Backup File Verified</Text>
              <Text style={{ fontSize: 11, color: colors.accentEmerald, fontWeight: '700' }}>{previewSummary.format}</Text>
            </View>

            <View style={[styles.previewRow, { borderColor: colors.border }]}>
              <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Workspace User:</Text>
              <Text style={[styles.previewVal, { color: colors.text }]}>{previewSummary.userName}</Text>
            </View>
            <View style={[styles.previewRow, { borderColor: colors.border }]}>
              <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Tasks:</Text>
              <Text style={[styles.previewVal, { color: colors.text }]}>{previewSummary.tasksCount} records</Text>
            </View>
            <View style={[styles.previewRow, { borderColor: colors.border }]}>
              <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Events:</Text>
              <Text style={[styles.previewVal, { color: colors.text }]}>{previewSummary.eventsCount} records</Text>
            </View>
            <View style={[styles.previewRow, { borderColor: colors.border }]}>
              <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Expenses:</Text>
              <Text style={[styles.previewVal, { color: colors.text }]}>{previewSummary.expensesCount} records</Text>
            </View>
            <View style={[styles.previewRow, { borderColor: colors.border }]}>
              <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>URLs:</Text>
              <Text style={[styles.previewVal, { color: colors.text }]}>{previewSummary.urlsCount} bookmarks</Text>
            </View>
            {previewSummary.attachmentsCount !== undefined && previewSummary.attachmentsCount > 0 && (
              <View style={[styles.previewRow, { borderColor: colors.border }]}>
                <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Attachments:</Text>
                <Text style={[styles.previewVal, { color: colors.text }]}>{previewSummary.attachmentsCount} media files</Text>
              </View>
            )}

            {/* Merge vs Replace Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: Spacing.md }}>
              <Button
                title="Merge Data"
                icon="git-merge-outline"
                variant="primary"
                onPress={handleMergeRestore}
                style={{ flex: 1 }}
              />
              <Button
                title="Replace All"
                icon="refresh-outline"
                variant="danger"
                onPress={handleReplaceRestore}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </View>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
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
  },
  sectionDesc: {
    fontSize: Typography.fontSize.xs,
    marginTop: 3,
    lineHeight: 17,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
    borderWidth: 1,
  },
  messageText: {
    fontSize: Typography.fontSize.xs,
    marginLeft: 6,
    flex: 1,
  },
  previewCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
  },
  previewTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
  },
  previewLabel: {
    fontSize: Typography.fontSize.xs,
  },
  previewVal: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
});
