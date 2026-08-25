import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { PageContainer } from '../../../components/page/PageContainer';
import { createExpensesStyles } from './ExpensesScreen.styles';
import { ExpenseFormModal } from '../../components/expenses/ExpenseFormModal';
import { FloatingActionButton } from '../../components/common/FloatingActionButton';
import { ExpenseItem } from '../../types';
import { PageLockGuard } from '../../components/security/PageLockGuard';
import {
  ExpenseService,
  EXPENSE_CATEGORY_COLORS,
  EXPENSE_CATEGORY_ICONS,
} from '../../services/expenseService';

export const ExpensesScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createExpensesStyles(colors), [colors]);

  const { expenses, addExpense, updateExpense, deleteExpense } = useWorkspace();

  // Current selected month: "YYYY-MM"
  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const [selectedYearMonth, setSelectedYearMonth] = useState(currentMonthStr);

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [y, m] = selectedYearMonth.split('-').map(Number);
    const prev = new Date(y, m - 2, 1);
    setSelectedYearMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedYearMonth.split('-').map(Number);
    const next = new Date(y, m, 1);
    setSelectedYearMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  };

  const formattedMonthTitle = useMemo(() => {
    const [y, m] = selectedYearMonth.split('-').map(Number);
    const d = new Date(y, m - 1, 1);
    return d.toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [selectedYearMonth]);

  // Calculations
  const monthlyItems = useMemo(
    () => ExpenseService.getMonthlyExpenses(expenses, selectedYearMonth),
    [expenses, selectedYearMonth]
  );

  const monthlyTotal = useMemo(
    () => ExpenseService.getMonthlyTotal(expenses, selectedYearMonth),
    [expenses, selectedYearMonth]
  );

  const dailyAvg = useMemo(
    () => ExpenseService.getDailyAverage(expenses, selectedYearMonth),
    [expenses, selectedYearMonth]
  );

  const highestExpense = useMemo(
    () => ExpenseService.getHighestExpense(expenses, selectedYearMonth),
    [expenses, selectedYearMonth]
  );

  const categoryBreakdown = useMemo(
    () => ExpenseService.getCategoryBreakdown(expenses, selectedYearMonth),
    [expenses, selectedYearMonth]
  );

  const comparisonPoints = useMemo(
    () => ExpenseService.getMonthOverMonthComparison(expenses, selectedYearMonth, 6),
    [expenses, selectedYearMonth]
  );

  const { deltaAmount, deltaPercent } = useMemo(
    () => ExpenseService.getDeltaWithPreviousMonth(expenses, selectedYearMonth),
    [expenses, selectedYearMonth]
  );

  // Max value for bar chart scaling
  const maxComparisonTotal = useMemo(() => {
    const max = Math.max(...comparisonPoints.map(p => p.total), 1);
    return max;
  }, [comparisonPoints]);

  const handleDelete = (item: ExpenseItem) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${item.title}" (₹${item.amount.toFixed(2)})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(item.id) },
      ]
    );
  };

  return (
    <PageContainer>
      <PageLockGuard pageId="Expenses" pageTitle="Monthly Expenses">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Monthly Expenses</Text>
            <Text style={styles.headerSubtitle}>Track spending & compare trends</Text>
          </View>

          <TouchableOpacity
            style={[styles.monthNavBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              setEditingExpense(null);
              setShowModal(true);
            }}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Month Selector Bar */}
        <View style={styles.monthSelector}>
          <TouchableOpacity style={styles.monthNavBtn} onPress={handlePrevMonth}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.monthTitleContainer}>
            <Text style={styles.monthTitle}>{formattedMonthTitle}</Text>
            <Text style={styles.monthYearSub}>
              {monthlyItems.length} {monthlyItems.length === 1 ? 'transaction' : 'transactions'}
            </Text>
          </View>

          <TouchableOpacity style={styles.monthNavBtn} onPress={handleNextMonth}>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Big Total Spend Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroCardTop}>
            <Text style={styles.heroLabel}>Total Monthly Spend</Text>
            {deltaPercent !== 0 && (
              <View
                style={[
                  styles.deltaBadge,
                  deltaAmount > 0 ? styles.deltaBadgePositive : styles.deltaBadgeNegative,
                ]}
              >
                <Ionicons
                  name={deltaAmount > 0 ? 'arrow-up' : 'arrow-down'}
                  size={12}
                  color={deltaAmount > 0 ? colors.error : colors.success}
                />
                <Text
                  style={[
                    styles.deltaText,
                    { color: deltaAmount > 0 ? colors.error : colors.success },
                  ]}
                >
                  {Math.abs(deltaPercent)}% vs last mo
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.heroAmount}>₹{monthlyTotal.toFixed(2)}</Text>
        </View>

        {/* 2-Column Metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <View style={styles.metricIconRow}>
              <Text style={styles.metricLabel}>Daily Average</Text>
              <View style={[styles.metricIconWrapper, { backgroundColor: `${colors.primary}20` }]}>
                <Ionicons name="calendar-outline" size={16} color={colors.primaryLight} />
              </View>
            </View>
            <Text style={styles.metricValue}>₹{dailyAvg.toFixed(2)}</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIconRow}>
              <Text style={styles.metricLabel}>Highest Expense</Text>
              <View style={[styles.metricIconWrapper, { backgroundColor: `${colors.accentOrange}20` }]}>
                <Ionicons name="trending-up" size={16} color={colors.accentOrange} />
              </View>
            </View>
            <Text style={styles.metricValue} numberOfLines={1}>
              {highestExpense ? `₹${highestExpense.amount.toFixed(2)}` : '₹0.00'}
            </Text>
          </View>
        </View>

        {/* Month-over-Month Comparison Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Monthly Comparison</Text>
            <Text style={styles.chartLegend}>6-Month Trend (₹)</Text>
          </View>

          <View style={styles.chartBarsContainer}>
            {comparisonPoints.map(point => {
              const heightPercent = Math.max(Math.round((point.total / maxComparisonTotal) * 100), 6);
              const isSelected = point.monthKey === selectedYearMonth;

              return (
                <TouchableOpacity
                  key={point.monthKey}
                  style={styles.barColumn}
                  onPress={() => setSelectedYearMonth(point.monthKey)}
                >
                  <Text style={[styles.barAmountTooltip, isSelected && { color: colors.primaryLight }]}>
                    {point.total > 0 ? `₹${Math.round(point.total)}` : ''}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: `${heightPercent}%` },
                        isSelected && styles.barFillCurrent,
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, isSelected && styles.barLabelCurrent]}>
                    {point.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            {categoryBreakdown.map(cat => (
              <View key={cat.category} style={styles.categoryRow}>
                <View style={styles.categoryInfoRow}>
                  <View style={styles.categoryLeft}>
                    <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                    <Text style={styles.categoryName}>{cat.category}</Text>
                  </View>
                  <View style={styles.categoryRight}>
                    <Text style={styles.categoryAmount}>₹{cat.total.toFixed(2)}</Text>
                    <Text style={styles.categoryPercent}>({cat.percentage}%)</Text>
                  </View>
                </View>
                <View style={styles.categoryProgressBar}>
                  <View
                    style={[
                      styles.categoryProgressFill,
                      { width: `${cat.percentage}%`, backgroundColor: cat.color },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Transactions List */}
        <View style={{ marginTop: 8 }}>
          <Text style={styles.sectionTitle}>
            Transactions ({monthlyItems.length})
          </Text>

          {monthlyItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="wallet-outline"
                size={48}
                color={colors.textMuted}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>No expenses recorded</Text>
              <Text style={styles.emptySub}>
                Tap the + button to log your first expense for {formattedMonthTitle}.
              </Text>
            </View>
          ) : (
            monthlyItems.map(item => {
              const catColor = EXPENSE_CATEGORY_COLORS[item.category] || colors.primary;
              const catIcon = (EXPENSE_CATEGORY_ICONS[item.category] as any) || 'pricetag';

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => {
                    setEditingExpense(item);
                    setShowModal(true);
                  }}
                  onLongPress={() => handleDelete(item)}
                  style={styles.transactionItem}
                >
                  <View style={styles.transactionLeft}>
                    <View
                      style={[
                        styles.transactionIconBox,
                        { backgroundColor: `${catColor}20`, borderColor: `${catColor}40`, borderWidth: 1 },
                      ]}
                    >
                      <Ionicons name={catIcon} size={20} color={catColor} />
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionTitle}>{item.title}</Text>
                      <Text style={styles.transactionMeta}>
                        {item.date} • {item.category} {item.paymentMethod ? `• ${item.paymentMethod}` : ''}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.transactionAmount}>-₹{item.amount.toFixed(2)}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Floating Add Action */}
      <FloatingActionButton
        onPress={() => {
          setEditingExpense(null);
          setShowModal(true);
        }}
      />

      {/* Expense Form Modal */}
      <ExpenseFormModal
        visible={showModal}
        expense={editingExpense}
        onClose={() => {
          setShowModal(false);
          setEditingExpense(null);
        }}
        onSave={data => {
          if (editingExpense) {
            updateExpense({ ...editingExpense, ...data });
          } else {
            addExpense(data);
          }
        }}
      />
      </PageLockGuard>
    </PageContainer>
  );
};
