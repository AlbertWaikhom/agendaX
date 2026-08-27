import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
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
  const { exportData, importData } = useWorkspace();
  const [loadingExport, setLoadingExport] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Import state
  const [parsedData, setParsedData] = useState<WorkspaceData | null>(null);
  const [previewSummary, setPreviewSummary] = useState<{
    tasksCount: number;
    eventsCount: number;
    expensesCount: number;
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
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}20` }]}>
            <Ionicons name="cloud-upload-outline" size={22} color={colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Export Workspace JSON</Text>
            <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
              Save all your tasks, events, expenses, URLs, and settings into a standard offline JSON backup file.
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Import & Restore JSON</Text>
            <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
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
          <View style={[styles.messageBox, { backgroundColor: colors.errorBg, borderColor: colors.error }]}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
            <Text style={[styles.messageText, { color: colors.error }]}>{importError}</Text>
          </View>
        )}

        {/* Backup Summary Preview */}
        {previewSummary && (
          <View style={[styles.previewCard, { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderLight }]}>
            <Text style={[styles.previewTitle, { color: colors.primaryLight }]}>Backup File Summary</Text>
            <View style={[styles.previewRow, { borderColor: colors.border }]}>
              <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Owner:</Text>
              <Text style={[styles.previewVal, { color: colors.text }]}>{previewSummary.userName}</Text>
            </View>
            <View style={[styles.previewRow, { borderColor: colors.border }]}>
              <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Tasks:</Text>
              <Text style={[styles.previewVal, { color: colors.text }]}>{previewSummary.tasksCount} tasks</Text>
            </View>
            <View style={[styles.previewRow, { borderColor: colors.border }]}>
              <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Events:</Text>
              <Text style={[styles.previewVal, { color: colors.text }]}>{previewSummary.eventsCount} events</Text>
            </View>
            <View style={[styles.previewRow, { borderColor: colors.border }]}>
              <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Expenses:</Text>
              <Text style={[styles.previewVal, { color: colors.text }]}>{previewSummary.expensesCount} expenses</Text>
            </View>
            <View style={[styles.previewRow, { borderColor: colors.border }]}>
              <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>URLs:</Text>
              <Text style={[styles.previewVal, { color: colors.text }]}>{previewSummary.urlsCount} bookmarks</Text>
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
    marginBottom: 8,
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
