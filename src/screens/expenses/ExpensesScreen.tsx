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

  const { expenses, unreadNotificationsCount, addExpense, updateExpense, deleteExpense } = useWorkspace();

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

  const monthShortName = useMemo(() => {
    const [y, m] = selectedYearMonth.split('-').map(Number);
    const d = new Date(y, m - 1, 1);
    return d.toLocaleString('default', { month: 'long' });
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

  // Target Budget Calculation (default ₹50k or dynamic balance)
  const monthlyBudget = 50000;
  const totalBalance = Math.max(0, monthlyBudget - monthlyTotal);

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
                onPress={handlePrevMonth}
                activeOpacity={0.7}
              >
                <Ionicons name="calendar-outline" size={20} color={colors.primaryLight} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => {
                  setAlertConfig({
                    visible: true,
                    title: 'Spending Notifications',
                    message: monthlyTotal > monthlyBudget * 0.8
                      ? `Alert: You have reached ${Math.round((monthlyTotal / monthlyBudget) * 100)}% of your monthly budget limit.`
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

          {/* Hero Budget & Donut Chart Card (Matching Mockup) */}
          <View style={styles.budgetHeroCard}>
            <View style={styles.budgetHeroHeader}>
              <TouchableOpacity
                style={styles.budgetHeroTitleRow}
                onPress={handleNextMonth}
                activeOpacity={0.7}
              >
                <Text style={styles.budgetHeroTitle}>{monthShortName} Budget</Text>
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
                ₹{monthlyTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </Text>
            </Text>

            {/* Donut Chart with Surrounding Category Labels */}
            <ExpenseDonutChart
              categories={categoryBreakdown}
              totalSpent={monthlyTotal}
              currencySymbol="₹"
            />
          </View>

          {/* Total Balance Card (Matching Mockup) */}
          <View style={styles.totalBalanceCard}>
            <View style={styles.totalBalanceLeft}>
              <View style={styles.totalBalanceIconBox}>
                <Ionicons name="wallet-outline" size={20} color={colors.accentEmerald} />
              </View>
              <View>
                <Text style={styles.totalBalanceTitle}>Total Balance</Text>
                <Text style={styles.totalBalanceSubtitle}>Remaining budget</Text>
              </View>
            </View>

            <View style={styles.totalBalanceBadge}>
              <Text style={styles.totalBalanceValue}>
                ₹{totalBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </Text>
            </View>
          </View>

          {/* Bar Graph Analytics Component (Requested by user) */}
          <ExpenseBarGraph
            monthlyPoints={comparisonPoints}
            categoryBreakdown={categoryBreakdown}
            currencySymbol="₹"
            onSelectMonth={monthKey => setSelectedYearMonth(monthKey)}
          />

          {/* Secure with Biometrics Card (Matching Mockup) */}
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
