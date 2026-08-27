import { Database } from '../database';
import { ExpenseItem } from '../../types';

export const ExpenseRepository = {
  async getAllExpenses(): Promise<ExpenseItem[]> {
    const db = await Database.getDatabaseAsync();
    const rows = await db.getAllAsync<any>(
      `SELECT id, title, amount, category, date, payment_method, notes,
              created_at, updated_at
       FROM expenses ORDER BY date DESC, created_at DESC;`
    );

    return rows.map(r => ({
      id: r.id,
      title: r.title,
      amount: Number(r.amount) || 0,
      category: r.category,
      date: r.date,
      paymentMethod: r.payment_method || undefined,
      notes: r.notes || undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at || undefined,
    }));
  },

  async insertExpense(expense: ExpenseItem): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync(
      `INSERT INTO expenses (
         id, title, amount, category, date, payment_method, notes,
         created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        expense.id,
        expense.title,
        expense.amount,
        expense.category,
        expense.date,
        expense.paymentMethod || null,
        expense.notes || null,
        expense.createdAt,
        expense.updatedAt || null,
      ]
    );
  },

  async updateExpense(expense: ExpenseItem): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync(
      `UPDATE expenses SET
         title = ?, amount = ?, category = ?, date = ?, payment_method = ?, notes = ?,
         updated_at = ?
       WHERE id = ?;`,
      [
        expense.title,
        expense.amount,
        expense.category,
        expense.date,
        expense.paymentMethod || null,
        expense.notes || null,
        expense.updatedAt || null,
        expense.id,
      ]
    );
  },

  async deleteExpense(id: string): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync('DELETE FROM expenses WHERE id = ?;', [id]);
  },

  async bulkInsertExpenses(expenses: ExpenseItem[]): Promise<void> {
    if (expenses.length === 0) return;
    const db = await Database.getDatabaseAsync();
    for (const exp of expenses) {
      await db.runAsync(
        `INSERT OR REPLACE INTO expenses (
           id, title, amount, category, date, payment_method, notes,
           created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          exp.id,
          exp.title,
          exp.amount,
          exp.category,
          exp.date,
          exp.paymentMethod || null,
          exp.notes || null,
          exp.createdAt,
          exp.updatedAt || null,
        ]
      );
    }
  },

  async clearAllExpenses(): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync('DELETE FROM expenses;');
  },

  async countExpenses(): Promise<number> {
    const db = await Database.getDatabaseAsync();
    const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM expenses;');
    return result?.count || 0;
  },
};
