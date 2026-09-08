import { ExpenseItem, ExpenseCategory } from '../types';

export interface CategoryBreakdown {
  category: ExpenseCategory;
  total: number;
  percentage: number;
  count: number;
  color: string;
}

export interface MonthlyComparisonPoint {
  monthKey: string;
  label: string;
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

  getMonthlyExpenses(expenses: ExpenseItem[], yearMonth: string): ExpenseItem[] {
    return expenses
      .filter(item => item.date.startsWith(yearMonth))
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  getMonthlyTotal(expenses: ExpenseItem[], yearMonth: string): number {
    return this.getMonthlyExpenses(expenses, yearMonth).reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );
  },

  getDailyAverage(expenses: ExpenseItem[], yearMonth: string): number {
    const monthlyItems = this.getMonthlyExpenses(expenses, yearMonth);
    if (monthlyItems.length === 0) return 0;

    const [year, month] = yearMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const total = this.getMonthlyTotal(expenses, yearMonth);
    return total / daysInMonth;
  },

  getHighestExpense(expenses: ExpenseItem[], yearMonth: string): ExpenseItem | null {
    const monthlyItems = this.getMonthlyExpenses(expenses, yearMonth);
    if (monthlyItems.length === 0) return null;
    return monthlyItems.reduce((max, item) => (item.amount > max.amount ? item : max), monthlyItems[0]);
  },

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

  getAvailableYears(expenses: ExpenseItem[]): string[] {
    const years = new Set<string>();
    const currentYear = String(new Date().getFullYear());
    years.add(currentYear);

    for (const item of expenses) {
      if (item.date && item.date.length >= 4) {
        const y = item.date.slice(0, 4);
        if (/^\d{4}$/.test(y)) {
          years.add(y);
        }
      }
    }

    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  },

  getYearlyExpenses(expenses: ExpenseItem[], year: string): ExpenseItem[] {
    return expenses
      .filter(item => item.date.startsWith(year))
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  getYearlyTotal(expenses: ExpenseItem[], year: string): number {
    return this.getYearlyExpenses(expenses, year).reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );
  },

  getYearlyCategoryBreakdown(expenses: ExpenseItem[], year: string): CategoryBreakdown[] {
    const yearlyItems = this.getYearlyExpenses(expenses, year);
    const total = this.getYearlyTotal(expenses, year);
    if (total === 0 || yearlyItems.length === 0) return [];

    const map = new Map<string, { total: number; count: number }>();

    yearlyItems.forEach(item => {
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

  getYearlyMonthlyComparison(expenses: ExpenseItem[], year: string): MonthlyComparisonPoint[] {
    const y = Number(year) || new Date().getFullYear();
    const points: MonthlyComparisonPoint[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    for (let m = 1; m <= 12; m++) {
      const mStr = String(m).padStart(2, '0');
      const key = `${y}-${mStr}`;
      const total = this.getMonthlyTotal(expenses, key);

      points.push({
        monthKey: key,
        label: monthNames[m - 1],
        year: y,
        total,
        isCurrent: key === currentYearMonth,
      });
    }

    return points;
  },
};
