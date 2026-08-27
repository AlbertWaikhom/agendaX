import { Platform } from 'react-native';
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { AttachmentItem, AttachmentParentType } from '../types';
import { FileStorage } from './fileStorage';
import { AttachmentRepository } from '../database/repositories/attachmentRepository';
import { Encryption } from './encryption';

export const MediaStorage = {
  /**
   * Pick an image from gallery
   */
  async pickImage(): Promise<{ success: boolean; uri?: string; fileName?: string; mimeType?: string; fileSize?: number; error?: string }> {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return { success: false, error: 'Permission to access media library was denied' };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { success: false, error: 'Cancelled' };
      }

      const asset = result.assets[0];
      return {
        success: true,
        uri: asset.uri,
        fileName: asset.fileName || `image_${Date.now()}.jpg`,
        mimeType: asset.mimeType || 'image/jpeg',
        fileSize: asset.fileSize || 0,
      };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Error selecting image' };
    }
  },

  /**
   * Pick any document or media file
   */
  async pickDocument(): Promise<{ success: boolean; uri?: string; fileName?: string; mimeType?: string; fileSize?: number; error?: string }> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { success: false, error: 'Cancelled' };
      }

      const asset = result.assets[0];
      return {
        success: true,
        uri: asset.uri,
        fileName: asset.name || `doc_${Date.now()}`,
        mimeType: asset.mimeType || 'application/octet-stream',
        fileSize: asset.size || 0,
      };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Error selecting document' };
    }
  },

  /**
   * Ingest and save an attachment file to AgendaX internal scoped storage
   */
  async saveAttachment(params: {
    parentType: AttachmentParentType;
    parentId: string;
    sourceUri: string;
    originalFileName: string;
    mimeType: string;
    fileSize?: number;
  }): Promise<AttachmentItem> {
    await FileStorage.ensureDirectoriesAsync();

    const attachmentId = Encryption.generateUUID();
    const extension = params.originalFileName.includes('.')
      ? params.originalFileName.split('.').pop()
      : 'dat';
    const storedFileName = `${attachmentId}.${extension}`;

    let category: 'images' | 'videos' | 'audio' | 'documents' = 'documents';
    if (params.mimeType.startsWith('image/')) category = 'images';
    else if (params.mimeType.startsWith('video/')) category = 'videos';
    else if (params.mimeType.startsWith('audio/')) category = 'audio';

    const relativePath = `media/${category}/${storedFileName}`;

    let finalSize = params.fileSize || 0;

    if (Platform.OS !== 'web') {
      try {
        const destDir = FileStorage.getMediaDirectory(category);
        const destFile = new File(destDir, storedFileName);

        const sourceFile = new File(params.sourceUri);
        if (sourceFile.exists) {
          sourceFile.copy(destFile);
          finalSize = destFile.size || finalSize;
        }
      } catch (e) {
        console.warn('[MediaStorage] Failed to copy physical file:', e);
      }
    }

    const attachment: AttachmentItem = {
      id: attachmentId,
      parentType: params.parentType,
      parentId: params.parentId,
      fileName: params.originalFileName,
      storedFileName,
      relativePath,
      mimeType: params.mimeType,
      fileSize: finalSize,
      isEncrypted: false,
      createdAt: new Date().toISOString(),
    };

    await AttachmentRepository.insertAttachment(attachment);
    return attachment;
  },

  /**
   * Delete an attachment from SQLite and filesystem
   */
  async deleteAttachment(attachment: AttachmentItem): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        const rootDir = FileStorage.getRootDirectory();
        const file = new File(rootDir, attachment.relativePath);
        if (file.exists) {
          file.delete();
        }
      }
    } catch (e) {
      console.warn('[MediaStorage] Error deleting physical file:', e);
    }
    await AttachmentRepository.deleteAttachment(attachment.id);
  },

  /**
   * Cascade delete all attachments for a parent record
   */
  async deleteAttachmentsForParent(parentType: AttachmentParentType, parentId: string): Promise<void> {
    try {
      const attachments = await AttachmentRepository.getAttachmentsByParent(parentType, parentId);
      for (const att of attachments) {
        await this.deleteAttachment(att);
      }
    } catch (e) {
      console.warn('[MediaStorage] Error cascade deleting attachments:', e);
    }
  },
};
