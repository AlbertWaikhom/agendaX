import { Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';

export interface StorageDirectories {
  root: string;
  database: string;
  media: {
    images: string;
    videos: string;
    audio: string;
    documents: string;
  };
  backups: string;
  temp: string;
}

export const FileStorage = {

  async ensureDirectoriesAsync(): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const baseDir = Paths.document;
      const agendaXDir = new Directory(baseDir, 'AgendaX');
      if (!agendaXDir.exists) {
        agendaXDir.create();
      }

      const dbDir = new Directory(agendaXDir, 'database');
      if (!dbDir.exists) dbDir.create();

      const mediaDir = new Directory(agendaXDir, 'media');
      if (!mediaDir.exists) mediaDir.create();

      const imagesDir = new Directory(mediaDir, 'images');
      if (!imagesDir.exists) imagesDir.create();

      const videosDir = new Directory(mediaDir, 'videos');
      if (!videosDir.exists) videosDir.create();

      const audioDir = new Directory(mediaDir, 'audio');
      if (!audioDir.exists) audioDir.create();

      const docsDir = new Directory(mediaDir, 'documents');
      if (!docsDir.exists) docsDir.create();

      const backupsDir = new Directory(agendaXDir, 'backups');
      if (!backupsDir.exists) backupsDir.create();

      const tempDir = new Directory(agendaXDir, 'temp');
      if (!tempDir.exists) tempDir.create();
    } catch (e) {
      console.warn('[FileStorage] Ensure directories warning:', e);
    }
  },

  getRootDirectory(): Directory {
    return new Directory(Paths.document, 'AgendaX');
  },

  getMediaDirectory(category: 'images' | 'videos' | 'audio' | 'documents'): Directory {
    const root = this.getRootDirectory();
    const media = new Directory(root, 'media');
    return new Directory(media, category);
  },

  getBackupsDirectory(): Directory {
    const root = this.getRootDirectory();
    return new Directory(root, 'backups');
  },

  getTempDirectory(): Directory {
    const root = this.getRootDirectory();
    return new Directory(root, 'temp');
  },

  resolveUri(relativePath: string): string {
    if (Platform.OS === 'web') return relativePath;
    if (relativePath.startsWith('file://') || relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    const cleanRelative = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
    const rootDir = this.getRootDirectory();
    const file = new File(rootDir, cleanRelative);
    return file.uri;
  },

  async cleanTempDirectory(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      const tempDir = this.getTempDirectory();
      if (tempDir.exists) {
        tempDir.delete();
        tempDir.create();
      }
    } catch (e) {
      console.warn('[FileStorage] Error cleaning temp directory:', e);
    }
  },

  /**
   * Copy any source media (picker cache, content://, file://) into persistent AgendaX media directory
   */
  async copyMediaToStorageAsync(
    sourceUri: string,
    category: 'images' | 'videos' | 'audio' | 'documents' = 'images',
    suggestedFileName?: string
  ): Promise<string> {
    if (Platform.OS === 'web' || !sourceUri) return sourceUri;

    try {
      await this.ensureDirectoriesAsync();
      const targetDir = this.getMediaDirectory(category);
      const ext = suggestedFileName?.includes('.')
        ? suggestedFileName.split('.').pop()
        : sourceUri.includes('.')
          ? sourceUri.split('.').pop()?.split('?')[0] || 'jpg'
          : 'jpg';

      const fileName = suggestedFileName || `${category.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const destFile = new File(targetDir, fileName);

      const srcFile = new File(sourceUri);
      if (srcFile.exists) {
        srcFile.copy(destFile);
        return destFile.uri;
      }

      return sourceUri;
    } catch (e) {
      console.warn('[FileStorage] copyMediaToStorageAsync fallback:', e);
      return sourceUri;
    }
  },
};
