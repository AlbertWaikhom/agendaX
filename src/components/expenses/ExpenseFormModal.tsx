import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { ExpenseItem, ExpenseCategory, PaymentMethod } from '../../types';
import { EXPENSE_CATEGORY_COLORS, EXPENSE_CATEGORY_ICONS } from '../../services/expenseService';
import { getTodayDateString } from '../../utils';

interface ExpenseFormModalProps {
  visible: boolean;
  expense?: ExpenseItem | null;
  onClose: () => void;
  onSave: (params: {
    title: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    paymentMethod?: PaymentMethod;
    notes?: string;
  }) => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Food & Dining',
  'Housing',
  'Transportation',
  'Utilities',
  'Shopping',
  'Entertainment',
  'Health',
  'Work',
  'Personal',
  'Other',
];

const PAYMENT_METHODS: PaymentMethod[] = ['Card', 'Cash', 'UPI', 'Bank Transfer', 'Digital Wallet', 'Other'];

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  visible,
  expense,
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food & Dining');
  const [date, setDate] = useState(getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(String(expense.amount));
      setCategory(expense.category);
      setDate(expense.date);
      setPaymentMethod(expense.paymentMethod || 'Card');
      setNotes(expense.notes || '');
    } else {
      resetForm();
    }
  }, [expense, visible]);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory('Food & Dining');
    setDate(getTodayDateString());
    setPaymentMethod('Card');
    setNotes('');
  };

  const handleSave = () => {
    const trimmedTitle = title.trim();
    const numAmount = parseFloat(amount);

    if (!trimmedTitle) {
      Alert.alert('Required', 'Please enter an expense title / description.');
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid expense amount greater than 0.');
      return;
    }

    onSave({
      title: trimmedTitle,
      amount: numAmount,
      category,
      date,
      paymentMethod,
      notes: notes.trim() || undefined,
    });

    onClose();
    resetForm();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
      >
        <View style={[styles.modalCard, { backgroundColor: colors.modalBackground, borderColor: colors.glassBorder }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {expense ? 'Edit Expense' : 'Add New Expense'}
            </Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surfaceHighlight }]}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
            {/* Amount Big Input */}
            <View style={[styles.amountBox, { backgroundColor: colors.surfaceHighlight, borderColor: colors.glassBorder }]}>
              <Text style={[styles.currencyPrefix, { color: colors.primaryLight }]}>₹</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                style={[styles.amountInput, { color: colors.text }]}
              />
            </View>

            {/* Title / Description */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>TITLE / DESCRIPTION *</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Grocery shopping, Electricity bill"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.inputField,
                { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderLight, color: colors.text },
              ]}
            />

            {/* Category Selector */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              <View style={styles.chipRow}>
                {CATEGORIES.map(cat => {
                  const isSelected = category === cat;
                  const catColor = EXPENSE_CATEGORY_COLORS[cat] || colors.primary;
                  const catIcon = (EXPENSE_CATEGORY_ICONS[cat] as any) || 'pricetag';

                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: isSelected ? `${catColor}30` : colors.surfaceHighlight,
                          borderColor: isSelected ? catColor : colors.border,
                        },
                      ]}
                    >
                      <Ionicons name={catIcon} size={15} color={isSelected ? catColor : colors.textSecondary} />
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? colors.text : colors.textSecondary, fontWeight: isSelected ? '700' : '500' },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Date & Payment Method */}
            <View style={styles.twoColumnRow}>
              <View style={styles.columnItem}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>DATE (YYYY-MM-DD)</Text>
                <TextInput
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.inputField,
                    { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderLight, color: colors.text },
                  ]}
                />
              </View>

              <View style={styles.columnItem}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>PAYMENT METHOD</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipRow}>
                    {PAYMENT_METHODS.slice(0, 3).map(method => (
                      <TouchableOpacity
                        key={method}
                        onPress={() => setPaymentMethod(method)}
                        style={[
                          styles.smallChip,
                          {
                            backgroundColor: paymentMethod === method ? colors.primary : colors.surfaceHighlight,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.smallChipText,
                            { color: paymentMethod === method ? '#FFF' : colors.textSecondary },
                          ]}
                        >
                          {method}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            {/* Optional Notes */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>NOTES (OPTIONAL)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional details..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              style={[
                styles.inputField,
                styles.notesField,
                { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderLight, color: colors.text },
              ]}
            />
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.cancelBtn, { backgroundColor: colors.surfaceHighlight }]}
            >
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.saveBtnText}>{expense ? 'Save Changes' : 'Add Expense'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 36 : Spacing.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.heavy,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContent: {
    paddingBottom: Spacing.md,
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  currencyPrefix: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.heavy,
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.display,
    fontWeight: Typography.fontWeight.heavy,
    padding: 0,
  },
  fieldLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 4,
  },
  inputField: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.md,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  notesField: {
    height: 72,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  chipScroll: {
    marginBottom: Spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  columnItem: {
    flex: 1,
  },
  smallChip: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  smallChipText: {
    fontFamily: Typography.fontFamily,
    fontSize: 11,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  saveBtn: {
    flex: 2,
    height: 50,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  saveBtnText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.heavy,
    color: '#FFFFFF',
  },
});
