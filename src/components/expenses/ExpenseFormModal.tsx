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
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { ExpenseItem, ExpenseCategory, PaymentMethod } from '../../types';
import { EXPENSE_CATEGORY_COLORS, EXPENSE_CATEGORY_ICONS } from '../../services/expenseService';
import { getTodayDateString } from '../../utils';
import { FileStorage } from '../../storage/fileStorage';
import { MediaStorage } from '../../storage/mediaStorage';
import { File } from 'expo-file-system';
import { CustomAlertModal } from '../common/CustomAlertModal';

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
    transactionId?: string;
    receiptUri?: string;
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
  const [transactionId, setTransactionId] = useState('');
  const [receiptUri, setReceiptUri] = useState<string | undefined>(undefined);
  const [showFullImage, setShowFullImage] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(String(expense.amount));
      setCategory(expense.category);
      setDate(expense.date);
      setPaymentMethod(expense.paymentMethod || 'Card');
      setNotes(expense.notes || '');
      setTransactionId(expense.transactionId || '');
      setReceiptUri(expense.receiptUri);
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
    setTransactionId('');
    setReceiptUri(undefined);
  };

  const handlePickReceipt = async () => {
    try {
      const res = await MediaStorage.pickImage('payment receipt/screenshot');
      if (res.success && res.uri) {
        setReceiptUri(res.uri);
      }
    } catch (e: any) {
      console.warn('[ExpenseFormModal] Receipt upload error:', e);
    }
  };

  const handleSave = () => {
    const trimmedTitle = title.trim();
    const numAmount = parseFloat(amount);

    if (!trimmedTitle) {
      setAlertConfig({
        visible: true,
        title: 'Title Required',
        message: 'Please enter an expense title or description to continue.',
        icon: 'alert-circle',
        iconColor: colors.error,
      });
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      setAlertConfig({
        visible: true,
        title: 'Invalid Amount',
        message: 'Please enter a valid expense amount greater than 0.',
        icon: 'wallet-outline',
        iconColor: colors.warning,
      });
      return;
    }

    onSave({
      title: trimmedTitle,
      amount: numAmount,
      category,
      date,
      paymentMethod,
      notes: notes.trim() || undefined,
      transactionId: transactionId.trim() || undefined,
      receiptUri,
    });

    onClose();
    resetForm();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={[styles.modalCard, { backgroundColor: colors.modalBackground, borderColor: colors.glassBorder }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {expense ? 'Edit Expense' : 'Add New Expense'}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>Record transaction to local SQLite</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surfaceHighlight }]}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.formContent}
          >
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
                    {PAYMENT_METHODS.map(method => (
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

            {/* Optional Transaction ID / Reference ID */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>TRANSACTION / REFERENCE ID (OPTIONAL)</Text>
            <TextInput
              value={transactionId}
              onChangeText={setTransactionId}
              placeholder="e.g. UPI Ref: 423981829381, TXN-92819"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.inputField,
                { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderLight, color: colors.text },
              ]}
            />

            {/* Optional Receipt Screenshot Upload */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>PAYMENT SCREENSHOT / RECEIPT (OPTIONAL)</Text>
            {receiptUri ? (
              <View style={[styles.receiptPreviewBox, { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderLight }]}>
                <TouchableOpacity onPress={() => setShowFullImage(true)} style={styles.receiptThumbWrapper}>
                  <Image source={{ uri: receiptUri }} style={styles.receiptThumb} />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.receiptFileName, { color: colors.text }]} numberOfLines={1}>
                    Screenshot Attached
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.primaryLight, marginTop: 2 }}>Tap image to expand</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setReceiptUri(undefined)}
                  style={[styles.removeReceiptBtn, { backgroundColor: colors.errorBg }]}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handlePickReceipt}
                style={[styles.uploadReceiptBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderLight }]}
                activeOpacity={0.7}
              >
                <Ionicons name="cloud-upload-outline" size={20} color={colors.primaryLight} />
                <Text style={[styles.uploadReceiptText, { color: colors.text }]}>Upload Payment Screenshot or Receipt</Text>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>PNG, JPG up to 10MB</Text>
              </TouchableOpacity>
            )}

            {/* Optional Notes */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>NOTES (OPTIONAL)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional details, breakdown, or itemized notes..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={[
                styles.inputField,
                styles.notesField,
                { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderLight, color: colors.text },
              ]}
            />

            {/* Action Buttons inside scrollview */}
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
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Full Image Viewer Modal */}
      {receiptUri && (
        <Modal visible={showFullImage} transparent animationType="fade" onRequestClose={() => setShowFullImage(false)}>
          <View style={[styles.fullImageOverlay, { backgroundColor: '#000000EB' }]}>
            <TouchableOpacity onPress={() => setShowFullImage(false)} style={styles.closeFullImageBtn}>
              <Ionicons name="close-circle" size={32} color="#FFFFFF" />
            </TouchableOpacity>
            <Image source={{ uri: receiptUri }} style={styles.fullImage} resizeMode="contain" />
          </View>
        </Modal>
      )}

      <CustomAlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        iconColor={alertConfig.iconColor}
        onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 36 : Spacing.md,
    maxHeight: '94%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
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
    paddingBottom: 220,
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  currencyPrefix: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.heavy,
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.heavy,
    paddingVertical: 8,
  },
  fieldLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 12,
  },
  inputField: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
  },
  notesField: {
    height: 100,
    paddingTop: Spacing.md,
  },
  chipScroll: {
    marginBottom: Spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
  },
  smallChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  smallChipText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  columnItem: {
    flex: 1,
  },
  uploadReceiptBtn: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  uploadReceiptText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
  },
  receiptPreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  receiptThumbWrapper: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  receiptThumb: {
    width: '100%',
    height: '100%',
  },
  receiptFileName: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
  },
  removeReceiptBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImageOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  closeFullImageBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
