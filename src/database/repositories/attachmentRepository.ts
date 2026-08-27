import { Database } from '../database';
import { AttachmentItem, AttachmentParentType } from '../../types';

export const AttachmentRepository = {
  async getAttachmentsByParent(parentType: AttachmentParentType, parentId: string): Promise<AttachmentItem[]> {
    const db = await Database.getDatabaseAsync();
    const rows = await db.getAllAsync<any>(
      `SELECT id, parent_type, parent_id, file_name, stored_file_name, relative_path,
              mime_type, file_size, is_encrypted, created_at
       FROM attachments
       WHERE parent_type = ? AND parent_id = ?
       ORDER BY created_at ASC;`,
      [parentType, parentId]
    );

    return rows.map(r => ({
      id: r.id,
      parentType: r.parent_type,
      parentId: r.parent_id,
      fileName: r.file_name,
      storedFileName: r.stored_file_name,
      relativePath: r.relative_path,
      mimeType: r.mime_type,
      fileSize: Number(r.file_size) || 0,
      isEncrypted: Boolean(r.is_encrypted),
      createdAt: r.created_at,
    }));
  },

  async getAllAttachments(): Promise<AttachmentItem[]> {
    const db = await Database.getDatabaseAsync();
    const rows = await db.getAllAsync<any>(
      `SELECT id, parent_type, parent_id, file_name, stored_file_name, relative_path,
              mime_type, file_size, is_encrypted, created_at
       FROM attachments ORDER BY created_at DESC;`
    );

    return rows.map(r => ({
      id: r.id,
      parentType: r.parent_type,
      parentId: r.parent_id,
      fileName: r.file_name,
      storedFileName: r.stored_file_name,
      relativePath: r.relative_path,
      mimeType: r.mime_type,
      fileSize: Number(r.file_size) || 0,
      isEncrypted: Boolean(r.is_encrypted),
      createdAt: r.created_at,
    }));
  },

  async insertAttachment(item: AttachmentItem): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync(
      `INSERT INTO attachments (
         id, parent_type, parent_id, file_name, stored_file_name, relative_path,
         mime_type, file_size, is_encrypted, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        item.id,
        item.parentType,
        item.parentId,
        item.fileName,
        item.storedFileName,
        item.relativePath,
        item.mimeType,
        item.fileSize,
        item.isEncrypted ? 1 : 0,
        item.createdAt,
      ]
    );
  },

  async deleteAttachment(id: string): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync('DELETE FROM attachments WHERE id = ?;', [id]);
  },

  async deleteAttachmentsByParent(parentType: AttachmentParentType, parentId: string): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync('DELETE FROM attachments WHERE parent_type = ? AND parent_id = ?;', [parentType, parentId]);
  },

  async bulkInsertAttachments(items: AttachmentItem[]): Promise<void> {
    if (items.length === 0) return;
    const db = await Database.getDatabaseAsync();
    for (const item of items) {
      await db.runAsync(
        `INSERT OR REPLACE INTO attachments (
           id, parent_type, parent_id, file_name, stored_file_name, relative_path,
           mime_type, file_size, is_encrypted, created_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          item.id,
          item.parentType,
          item.parentId,
          item.fileName,
          item.storedFileName,
          item.relativePath,
          item.mimeType,
          item.fileSize,
          item.isEncrypted ? 1 : 0,
          item.createdAt,
        ]
      );
    }
  },

  async clearAllAttachments(): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync('DELETE FROM attachments;');
  },

  async countAttachments(): Promise<number> {
    const db = await Database.getDatabaseAsync();
    const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM attachments;');
    return result?.count || 0;
  },
};
