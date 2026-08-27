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
};
