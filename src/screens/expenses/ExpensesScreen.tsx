import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { PageContainer } from '../../../components/page/PageContainer';
import { createExpensesStyles } from './ExpensesScreen.styles';
import { ExpenseFormModal } from '../../components/expenses/ExpenseFormModal';
import { FloatingActionButton } from '../../components/common/FloatingActionButton';
import { ExpenseItem } from '../../types';
import { PageLockGuard } from '../../components/security/PageLockGuard';
import { CustomAlertModal, AlertButton } from '../../components/common/CustomAlertModal';
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

  // Custom Alert Modal State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    buttons?: AlertButton[];
  }>({
    visible: false,
    title: '',
  });

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
    setAlertConfig({
      visible: true,
      title: 'Delete Expense',
      message: `Are you sure you want to delete "${item.title}" (₹${item.amount.toFixed(2)})?`,
      icon: 'trash-outline',
      iconColor: colors.error,
      buttons: [
        {
          text: 'Delete',
          style: 'destructive',
          icon: 'trash',
          onPress: () => deleteExpense(item.id),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    });
  };

  const handleCopyTxn = async (txnId: string) => {
    await Clipboard.setStringAsync(txnId);
    setAlertConfig({
      visible: true,
      title: 'Copied to Clipboard',
      message: `Transaction ID copied: ${txnId}`,
      icon: 'checkmark-circle-outline',
      iconColor: colors.success,
      buttons: [{ text: 'OK', style: 'primary' }],
    });
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
              style={styles.monthNavBtn}
              onPress={() => {
                setEditingExpense(null);
                setShowModal(true);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={24} color={colors.primaryLight} />
            </TouchableOpacity>
          </View>

          {/* Month Selector Bar */}
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.monthNavBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.monthTitleContainer}>
              <Text style={styles.monthTitle}>{formattedMonthTitle}</Text>
              <Text style={styles.monthYearSub}>Monthly Summary</Text>
            </View>

            <TouchableOpacity onPress={handleNextMonth} style={styles.monthNavBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Total Hero Glass Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroCardTop}>
              <Text style={styles.heroLabel}>TOTAL SPENT THIS MONTH</Text>
              {deltaPercent !== 0 && (
                <View
                  style={[
                    styles.deltaBadge,
                    deltaAmount > 0 ? styles.deltaBadgePositive : styles.deltaBadgeNegative,
                  ]}
                >
                  <Ionicons
                    name={deltaAmount > 0 ? 'trending-up' : 'trending-down'}
                    size={14}
                    color={deltaAmount > 0 ? colors.error : colors.success}
                  />
                  <Text
                    style={[
                      styles.deltaText,
                      { color: deltaAmount > 0 ? colors.error : colors.success },
                    ]}
                  >
                    {Math.abs(deltaPercent)}% vs last month
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.heroAmount}>₹{monthlyTotal.toFixed(2)}</Text>
          </View>

          {/* 2-Column Metrics Row */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <View style={styles.metricIconRow}>
                <Text style={styles.metricLabel}>DAILY AVG</Text>
                <View style={[styles.metricIconWrapper, { backgroundColor: `${colors.primary}20` }]}>
                  <Ionicons name="calendar-outline" size={16} color={colors.primaryLight} />
                </View>
              </View>
              <Text style={styles.metricValue}>₹{dailyAvg.toFixed(2)}</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricIconRow}>
                <Text style={styles.metricLabel}>HIGHEST</Text>
                <View style={[styles.metricIconWrapper, { backgroundColor: `${colors.accentPink}20` }]}>
                  <Ionicons name="flame-outline" size={16} color={colors.accentPink} />
                </View>
              </View>
              <Text style={styles.metricValue}>
                {highestExpense ? `₹${highestExpense.amount.toFixed(0)}` : '₹0'}
              </Text>
            </View>
          </View>

          {/* 6-Month Comparison History Bar Chart */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>6-Month Comparison</Text>
              <Text style={styles.chartLegend}>Spend trend</Text>
            </View>

            <View style={styles.chartBarsContainer}>
              {comparisonPoints.map(point => {
                const heightPercent = Math.min(100, Math.max(10, Math.round((point.total / maxComparisonTotal) * 100)));
                return (
                  <View key={point.monthKey} style={styles.barColumn}>
                    <Text style={styles.barAmountTooltip}>
                      {point.total > 0 ? `₹${(point.total / 1000).toFixed(0)}k` : '₹0'}
                    </Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          point.isCurrent && styles.barFillCurrent,
                          {
                            height: `${heightPercent}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.barLabel, point.isCurrent && styles.barLabelCurrent]}>
                      {point.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Category Breakdown Progress Bars */}
          {categoryBreakdown.length > 0 && (
            <View style={styles.categorySection}>
              <Text style={styles.sectionTitle}>Spending by Category</Text>
              {categoryBreakdown.map(cat => (
                <View key={cat.category} style={styles.categoryRow}>
                  <View style={styles.categoryInfoRow}>
                    <View style={styles.categoryLeft}>
                      <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                      <Text style={styles.categoryName}>{cat.category}</Text>
                    </View>
                    <View style={styles.categoryRight}>
                      <Text style={styles.categoryAmount}>₹{cat.total.toFixed(0)}</Text>
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
                        {/* Transaction ID Badge & Receipt Attachment Indicator */}
                        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                          {item.transactionId ? (
                            <TouchableOpacity
                              onPress={() => handleCopyTxn(item.transactionId!)}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 3,
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 6,
                                backgroundColor: colors.surfaceHighlight,
                                borderWidth: 1,
                                borderColor: colors.glassBorder,
                              }}
                            >
                              <Ionicons name="receipt-outline" size={10} color={colors.primaryLight} />
                              <Text style={{ fontSize: 10, color: colors.primaryLight, fontWeight: '700' }} numberOfLines={1}>
                                {item.transactionId}
                              </Text>
                            </TouchableOpacity>
                          ) : null}

                          {item.receiptUri ? (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 3,
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 6,
                                backgroundColor: `${colors.accentEmerald}20`,
                                borderWidth: 1,
                                borderColor: `${colors.accentEmerald}40`,
                              }}
                            >
                              <Ionicons name="image-outline" size={10} color={colors.accentEmerald} />
                              <Text style={{ fontSize: 10, color: colors.accentEmerald, fontWeight: '700' }}>
                                Screenshot Attached
                              </Text>
                            </View>
                          ) : null}
                        </View>
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

        {/* Custom Liquid Glass Alert Modal */}
        <CustomAlertModal
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          icon={alertConfig.icon}
          iconColor={alertConfig.iconColor}
          buttons={alertConfig.buttons}
          onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
        />
      </PageLockGuard>
    </PageContainer>
  );
};
