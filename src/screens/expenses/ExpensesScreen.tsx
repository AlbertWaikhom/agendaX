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
import { ExpenseDonutChart } from '../../components/expenses/ExpenseDonutChart';
import { ExpenseBarGraph } from '../../components/expenses/ExpenseBarGraph';
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

  // Selected Year & Month state for dual filtering
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<string>(String(today.getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState<string>(String(today.getMonth() + 1).padStart(2, '0'));

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

  const availableYears = useMemo(() => ExpenseService.getAvailableYears(expenses), [expenses]);

  const monthOptions = [
    { id: 'all', label: 'All Year' },
    { id: '01', label: 'Jan' },
    { id: '02', label: 'Feb' },
    { id: '03', label: 'Mar' },
    { id: '04', label: 'Apr' },
    { id: '05', label: 'May' },
    { id: '06', label: 'Jun' },
    { id: '07', label: 'Jul' },
    { id: '08', label: 'Aug' },
    { id: '09', label: 'Sep' },
    { id: '10', label: 'Oct' },
    { id: '11', label: 'Nov' },
    { id: '12', label: 'Dec' },
  ];

  const isAllYear = selectedMonth === 'all';
  const selectedYearMonth = `${selectedYear}-${selectedMonth}`;

  // Month / Year navigation helpers
  const handlePrev = () => {
    if (isAllYear) {
      setSelectedYear(prev => String(Number(prev) - 1));
    } else {
      const mNum = Number(selectedMonth);
      if (mNum === 1) {
        setSelectedYear(prev => String(Number(prev) - 1));
        setSelectedMonth('12');
      } else {
        setSelectedMonth(String(mNum - 1).padStart(2, '0'));
      }
    }
  };

  const handleNext = () => {
    if (isAllYear) {
      setSelectedYear(prev => String(Number(prev) + 1));
    } else {
      const mNum = Number(selectedMonth);
      if (mNum === 12) {
        setSelectedYear(prev => String(Number(prev) + 1));
        setSelectedMonth('01');
      } else {
        setSelectedMonth(String(mNum + 1).padStart(2, '0'));
      }
    }
  };

  const formattedPeriodTitle = useMemo(() => {
    if (isAllYear) return `Year ${selectedYear}`;
    const d = new Date(Number(selectedYear), Number(selectedMonth) - 1, 1);
    return d.toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [selectedYear, selectedMonth, isAllYear]);

  const periodShortName = useMemo(() => {
    if (isAllYear) return `${selectedYear}`;
    const d = new Date(Number(selectedYear), Number(selectedMonth) - 1, 1);
    return d.toLocaleString('default', { month: 'long' });
  }, [selectedYear, selectedMonth, isAllYear]);

  // Calculations based on Year / Month filter
  const displayedItems = useMemo(() => {
    if (isAllYear) {
      return ExpenseService.getYearlyExpenses(expenses, selectedYear);
    }
    return ExpenseService.getMonthlyExpenses(expenses, selectedYearMonth);
  }, [expenses, selectedYear, selectedMonth, isAllYear, selectedYearMonth]);

  const totalSpent = useMemo(() => {
    if (isAllYear) {
      return ExpenseService.getYearlyTotal(expenses, selectedYear);
    }
    return ExpenseService.getMonthlyTotal(expenses, selectedYearMonth);
  }, [expenses, selectedYear, selectedMonth, isAllYear, selectedYearMonth]);

  const categoryBreakdown = useMemo(() => {
    if (isAllYear) {
      return ExpenseService.getYearlyCategoryBreakdown(expenses, selectedYear);
    }
    return ExpenseService.getCategoryBreakdown(expenses, selectedYearMonth);
  }, [expenses, selectedYear, selectedMonth, isAllYear, selectedYearMonth]);

  const comparisonPoints = useMemo(() => {
    if (isAllYear) {
      return ExpenseService.getYearlyMonthlyComparison(expenses, selectedYear);
    }
    return ExpenseService.getMonthOverMonthComparison(expenses, selectedYearMonth, 6);
  }, [expenses, selectedYear, selectedMonth, isAllYear, selectedYearMonth]);

  // Target Budget Calculation (default ₹50k/mo or ₹600k/yr)
  const targetBudget = isAllYear ? 600000 : 50000;
  const totalBalance = Math.max(0, targetBudget - totalSpent);

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

  const handleBiometricPrompt = () => {
    setAlertConfig({
      visible: true,
      title: 'Biometric Security Active',
      message: 'Your expenses, accounts, and financial transactions are encrypted and secured with biometric authentication.',
      icon: 'finger-print-outline',
      iconColor: colors.accentCyan,
      buttons: [{ text: 'Done', style: 'primary' }],
    });
  };

  return (
    <PageContainer>
      <PageLockGuard pageId="Expenses" pageTitle="Expense & Budget">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Top Header - Expense & Budget */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Expense & Budget</Text>
              <Text style={styles.headerSubtitle}>Financial tracking & category insights</Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={handlePrev}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={20} color={colors.primaryLight} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={handleNext}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-forward" size={20} color={colors.primaryLight} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => {
                  setAlertConfig({
                    visible: true,
                    title: 'Spending Notifications',
                    message: totalSpent > targetBudget * 0.8
                      ? `Alert: You have reached ${Math.round((totalSpent / targetBudget) * 100)}% of your ${isAllYear ? 'annual' : 'monthly'} budget limit.`
                      : 'All budget limits and expense reminders are in healthy standing.',
                    icon: 'notifications-outline',
                    iconColor: colors.accentOrange,
                    buttons: [{ text: 'Got It', style: 'primary' }],
                  });
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Dual Filter Controls: Year-wise & Month-wise */}
          <View style={styles.filterContainer}>
            {/* Year Selector Chips */}
            <View style={styles.yearFilterRow}>
              <Ionicons name="calendar-outline" size={14} color={colors.primaryLight} style={{ marginRight: 8 }} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearFilterScroll}>
                {availableYears.map(yr => {
                  const active = selectedYear === yr;
                  return (
                    <TouchableOpacity
                      key={yr}
                      style={[styles.yearChip, active && styles.yearChipActive]}
                      onPress={() => setSelectedYear(yr)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.yearChipText, active && styles.yearChipTextActive]}>{yr}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Month Selector Carousel (All Year + 12 Months) */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthFilterScroll}>
              {monthOptions.map(opt => {
                const active = selectedMonth === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.monthChip, active && styles.monthChipActive]}
                    onPress={() => setSelectedMonth(opt.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.monthChipText, active && styles.monthChipTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Hero Budget & Donut Chart Card */}
          <View style={styles.budgetHeroCard}>
            <View style={styles.budgetHeroHeader}>
              <TouchableOpacity
                style={styles.budgetHeroTitleRow}
                onPress={handleNext}
                activeOpacity={0.7}
              >
                <Text style={styles.budgetHeroTitle}>{periodShortName} Budget</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.primaryLight} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.monthNavBtn}
                onPress={() => {
                  setEditingExpense(null);
                  setShowModal(true);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={22} color={colors.primaryLight} />
              </TouchableOpacity>
            </View>

            <Text style={styles.budgetTotalSpentText}>
              Total spent:{' '}
              <Text style={styles.budgetTotalSpentAmount}>
                ₹{totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </Text>
            </Text>

            {/* Donut Chart with Category Breakdown */}
            <ExpenseDonutChart
              categories={categoryBreakdown}
              totalSpent={totalSpent}
              currencySymbol="₹"
            />
          </View>

          {/* Total Balance Card */}
          <View style={styles.totalBalanceCard}>
            <View style={styles.totalBalanceLeft}>
              <View style={styles.totalBalanceIconBox}>
                <Ionicons name="wallet-outline" size={20} color={colors.accentEmerald} />
              </View>
              <View>
                <Text style={styles.totalBalanceTitle}>Total Balance</Text>
                <Text style={styles.totalBalanceSubtitle}>{isAllYear ? 'Remaining annual budget' : 'Remaining monthly budget'}</Text>
              </View>
            </View>

            <View style={styles.totalBalanceBadge}>
              <Text style={styles.totalBalanceValue}>
                ₹{totalBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </Text>
            </View>
          </View>

          {/* Bar Graph Analytics Component (Yearly trend or Monthly comparison) */}
          <ExpenseBarGraph
            monthlyPoints={comparisonPoints}
            categoryBreakdown={categoryBreakdown}
            currencySymbol="₹"
            onSelectMonth={monthKey => {
              const [y, m] = monthKey.split('-');
              setSelectedYear(y);
              setSelectedMonth(m);
            }}
          />

          {/* Secure with Biometrics Card */}
          <TouchableOpacity
            style={styles.biometricCard}
            onPress={handleBiometricPrompt}
            activeOpacity={0.85}
          >
            <Text style={styles.biometricTitle}>Secure with Biometrics</Text>

            <View style={styles.biometricIconCircle}>
              <Ionicons name="finger-print" size={38} color={colors.accentCyan} />
            </View>

            <View style={styles.biometricFooterPill}>
              <Ionicons name="shield-checkmark" size={12} color={colors.accentCyan} />
              <Text style={styles.biometricFooterText}>AGENDAX SECURED 🛡️</Text>
            </View>
          </TouchableOpacity>

          {/* Transactions List */}
          <View style={{ marginTop: 4 }}>
            <Text style={styles.sectionTitle}>
              Transactions ({displayedItems.length})
            </Text>

            {displayedItems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="wallet-outline"
                  size={48}
                  color={colors.textMuted}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>No expenses recorded</Text>
                <Text style={styles.emptySub}>
                  Tap the + button to log your first expense for {formattedPeriodTitle}.
                </Text>
              </View>
            ) : (
              displayedItems.map(item => {
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
                        {/* Transaction ID Badge & Receipt Indicator */}
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
