import { Database } from '../database';
import { UrlItem } from '../../types';

export const UrlRepository = {
  async getAllUrls(): Promise<UrlItem[]> {
    const db = await Database.getDatabaseAsync();
    const rows = await db.getAllAsync<any>(
      `SELECT id, title, url, category, note, preview_image_uri, created_at, updated_at
       FROM urls ORDER BY created_at DESC;`
    );

    return rows.map(r => ({
      id: r.id,
      title: r.title,
      url: r.url,
      category: r.category,
      note: r.note || undefined,
      previewImageUri: r.preview_image_uri || undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at || undefined,
    }));
  },

  async insertUrl(item: UrlItem): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync(
      `INSERT INTO urls (id, title, url, category, note, preview_image_uri, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        item.id,
        item.title,
        item.url,
        item.category,
        item.note || null,
        item.previewImageUri || null,
        item.createdAt,
        item.updatedAt || null,
      ]
    );
  },

  async updateUrl(item: UrlItem): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync(
      `UPDATE urls SET title = ?, url = ?, category = ?, note = ?, preview_image_uri = ?, updated_at = ?
       WHERE id = ?;`,
      [
        item.title,
        item.url,
        item.category,
        item.note || null,
        item.previewImageUri || null,
        item.updatedAt || null,
        item.id,
      ]
    );
  },

  async deleteUrl(id: string): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync('DELETE FROM urls WHERE id = ?;', [id]);
  },

  async bulkInsertUrls(urls: UrlItem[]): Promise<void> {
    if (urls.length === 0) return;
    const db = await Database.getDatabaseAsync();
    for (const item of urls) {
      await db.runAsync(
        `INSERT OR REPLACE INTO urls (id, title, url, category, note, preview_image_uri, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          item.id,
          item.title,
          item.url,
          item.category,
          item.note || null,
          item.previewImageUri || null,
          item.createdAt,
          item.updatedAt || null,
        ]
      );
    }
  },

  async clearAllUrls(): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync('DELETE FROM urls;');
  },

  async countUrls(): Promise<number> {
    const db = await Database.getDatabaseAsync();
    const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM urls;');
    return result?.count || 0;
  },
};
