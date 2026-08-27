import { Database } from '../database';
import { LocalUser } from '../../types';

export const UserRepository = {
  async getUser(): Promise<LocalUser | null> {
    const db = await Database.getDatabaseAsync();
    const row = await db.getFirstAsync<any>(
      'SELECT id, name, avatar_color, avatar_uri, created_at FROM users LIMIT 1;'
    );
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      avatarColor: row.avatar_color,
      avatarUri: row.avatar_uri || undefined,
      createdAt: row.created_at,
    };
  },

  async setUser(user: LocalUser | null): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync('DELETE FROM users;');
    if (user) {
      await db.runAsync(
        'INSERT INTO users (id, name, avatar_color, avatar_uri, created_at) VALUES (?, ?, ?, ?, ?);',
        [user.id, user.name, user.avatarColor, user.avatarUri || null, user.createdAt]
      );
    }
  },

  async updateUser(user: LocalUser): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync(
      'UPDATE users SET name = ?, avatar_color = ?, avatar_uri = ? WHERE id = ?;',
      [user.name, user.avatarColor, user.avatarUri || null, user.id]
    );
  },
};
