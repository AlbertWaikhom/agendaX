import { ExpenseItem, ExpenseCategory } from '../types';

export interface CategoryBreakdown {
  category: ExpenseCategory;
  total: number;
  percentage: number;
  count: number;
  color: string;
}

export interface MonthlyComparisonPoint {
  monthKey: string; // e.g. "2026-08"
  label: string; // e.g. "Aug"
  year: number;
  total: number;
  isCurrent: boolean;
}

export const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
  Housing: '#6366F1',
  'Food & Dining': '#F59E0B',
  Transportation: '#3B82F6',
  Utilities: '#06B6D4',
  Entertainment: '#EC4899',
  Shopping: '#8B5CF6',
  Health: '#10B981',
  Work: '#14B8A6',
  Personal: '#F97316',
  Other: '#94A3B8',
};

export const EXPENSE_CATEGORY_ICONS: Record<string, string> = {
  Housing: 'home',
  'Food & Dining': 'fast-food',
  Transportation: 'car',
  Utilities: 'flash',
  Entertainment: 'film',
  Shopping: 'cart',
  Health: 'medkit',
  Work: 'briefcase',
  Personal: 'person',
  Other: 'pricetag',
};

export const ExpenseService = {
  /**
   * Filter expenses by year and month ("YYYY-MM")
   */
  getMonthlyExpenses(expenses: ExpenseItem[], yearMonth: string): ExpenseItem[] {
    return expenses
      .filter(item => item.date.startsWith(yearMonth))
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  /**
   * Calculate total spent in a month
   */
  getMonthlyTotal(expenses: ExpenseItem[], yearMonth: string): number {
    return this.getMonthlyExpenses(expenses, yearMonth).reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );
  },

  /**
   * Calculate daily average in a month
   */
  getDailyAverage(expenses: ExpenseItem[], yearMonth: string): number {
    const monthlyItems = this.getMonthlyExpenses(expenses, yearMonth);
    if (monthlyItems.length === 0) return 0;

    const [year, month] = yearMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const total = this.getMonthlyTotal(expenses, yearMonth);
    return total / daysInMonth;
  },

  /**
   * Get highest individual expense in a month
   */
  getHighestExpense(expenses: ExpenseItem[], yearMonth: string): ExpenseItem | null {
    const monthlyItems = this.getMonthlyExpenses(expenses, yearMonth);
    if (monthlyItems.length === 0) return null;
    return monthlyItems.reduce((max, item) => (item.amount > max.amount ? item : max), monthlyItems[0]);
  },

  /**
   * Breakdown by category with percentage and colors
   */
  getCategoryBreakdown(expenses: ExpenseItem[], yearMonth: string): CategoryBreakdown[] {
    const monthlyItems = this.getMonthlyExpenses(expenses, yearMonth);
    const total = this.getMonthlyTotal(expenses, yearMonth);
    if (total === 0 || monthlyItems.length === 0) return [];

    const map = new Map<string, { total: number; count: number }>();

    monthlyItems.forEach(item => {
      const cat = item.category || 'Other';
      const prev = map.get(cat) || { total: 0, count: 0 };
      map.set(cat, {
        total: prev.total + Number(item.amount || 0),
        count: prev.count + 1,
      });
    });

    const result: CategoryBreakdown[] = [];
    map.forEach((value, cat) => {
      result.push({
        category: cat,
        total: value.total,
        percentage: Math.round((value.total / total) * 100),
        count: value.count,
        color: EXPENSE_CATEGORY_COLORS[cat] || '#818CF8',
      });
    });

    return result.sort((a, b) => b.total - a.total);
  },

  /**
   * Get 6-month comparison history for graphs
   */
  getMonthOverMonthComparison(
    expenses: ExpenseItem[],
    currentYearMonth: string,
    monthsCount = 6
  ): MonthlyComparisonPoint[] {
    const [currYear, currMonth] = currentYearMonth.split('-').map(Number);
    const points: MonthlyComparisonPoint[] = [];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(currYear, currMonth - 1 - i, 1);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const key = `${y}-${m}`;
      const total = this.getMonthlyTotal(expenses, key);

      points.push({
        monthKey: key,
        label: monthNames[date.getMonth()],
        year: y,
        total,
        isCurrent: key === currentYearMonth,
      });
    }

    return points;
  },

  /**
   * Compare current month total with previous month
   */
  getDeltaWithPreviousMonth(expenses: ExpenseItem[], currentYearMonth: string): { deltaAmount: number; deltaPercent: number } {
    const [year, month] = currentYearMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    const currentTotal = this.getMonthlyTotal(expenses, currentYearMonth);
    const prevTotal = this.getMonthlyTotal(expenses, prevKey);

    const deltaAmount = currentTotal - prevTotal;
    const deltaPercent = prevTotal > 0 ? Math.round((deltaAmount / prevTotal) * 100) : 0;

    return { deltaAmount, deltaPercent };
  },
};
