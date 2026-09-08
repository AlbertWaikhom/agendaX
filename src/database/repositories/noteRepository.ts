import { Database } from '../database';
import { NoteItem } from '../../types';

export const NoteRepository = {
  async getAllNotes(): Promise<NoteItem[]> {
    const db = await Database.getDatabaseAsync();
    const rows = await db.getAllAsync<any>(
      `SELECT id, title, content, category, color, pinned, created_at, updated_at
       FROM notes ORDER BY pinned DESC, updated_at DESC;`
    );

    return rows.map(r => ({
      id: r.id,
      title: r.title,
      content: r.content,
      category: r.category || 'General',
      color: r.color || undefined,
      pinned: Boolean(r.pinned),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  async insertNote(note: NoteItem): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync(
      `INSERT INTO notes (id, title, content, category, color, pinned, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        note.id,
        note.title,
        note.content,
        note.category || 'General',
        note.color || null,
        note.pinned ? 1 : 0,
        note.createdAt,
        note.updatedAt,
      ]
    );
  },

  async updateNote(note: NoteItem): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync(
      `UPDATE notes SET title = ?, content = ?, category = ?, color = ?, pinned = ?, updated_at = ?
       WHERE id = ?;`,
      [
        note.title,
        note.content,
        note.category || 'General',
        note.color || null,
        note.pinned ? 1 : 0,
        note.updatedAt,
        note.id,
      ]
    );
  },

  async togglePinNote(id: string, pinned: boolean): Promise<void> {
    const db = await Database.getDatabaseAsync();
    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE notes SET pinned = ?, updated_at = ? WHERE id = ?;`,
      [pinned ? 1 : 0, now, id]
    );
  },

  async deleteNote(id: string): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync('DELETE FROM notes WHERE id = ?;', [id]);
  },

  async bulkInsertNotes(notes: NoteItem[]): Promise<void> {
    if (notes.length === 0) return;
    const db = await Database.getDatabaseAsync();
    for (const note of notes) {
      await db.runAsync(
        `INSERT OR REPLACE INTO notes (id, title, content, category, color, pinned, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          note.id,
          note.title,
          note.content,
          note.category || 'General',
          note.color || null,
          note.pinned ? 1 : 0,
          note.createdAt,
          note.updatedAt,
        ]
      );
    }
  },

  async clearAllNotes(): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync('DELETE FROM notes;');
  },

  async countNotes(): Promise<number> {
    const db = await Database.getDatabaseAsync();
    const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM notes;');
    return result?.count || 0;
  },
};
