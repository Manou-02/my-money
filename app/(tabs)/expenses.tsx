import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import {
  Receipt,
  Wallet,
  Layers,
  Plus,
  Search,
  Filter,
  Calendar,
  ChevronRight,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useBudgetStore } from '../../src/stores/budgetStore';
import { useCategoryStore } from '../../src/stores/categoryStore';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { calculateBudgetStats } from '../../src/utils/budgetCalculations';
import { formatCurrency } from '../../src/utils/currency';
import { formatDate, isDateInPeriod } from '../../src/utils/dates';
import { themeColors } from '../../src/constants/theme';
import { CategoryIcon } from '../../src/components/native/CategoryIcon';
import { Budget, BudgetWithStats, Category, TimePeriodFilter, Transaction } from '../../src/types';

// Modals
import { BudgetFormModal } from '../../src/components/budgets/BudgetFormModal';
import { BudgetDetailModal } from '../../src/components/budgets/BudgetDetailModal';
import { ExpenseFormModal } from '../../src/components/expenses/ExpenseFormModal';
import { ExpenseDetailModal } from '../../src/components/expenses/ExpenseDetailModal';
import { CategoryFormModal } from '../../src/components/categories/CategoryFormModal';
import { CategoryManagementModal } from '../../src/components/categories/CategoryManagementModal';

export default function ExpensesScreen() {
  const { t, i18n } = useTranslation();
  const { settings } = useSettingsStore();
  const { budgets, activeBudgetId, createBudget, updateBudget, deleteBudget } = useBudgetStore();
  const { categories, createCategory, updateCategory, deleteOrDeactivateCategory } = useCategoryStore();
  const { transactions, createTransaction, updateTransaction, deleteTransaction } = useTransactionStore();

  const isDark = settings.theme === 'dark';
  const colors = isDark ? themeColors.dark : themeColors.light;

  // Subtabs: 'list' | 'budgets' | 'categories'
  const [subtab, setSubtab] = useState<'list' | 'budgets' | 'categories'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriodFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [expenseDetailOpen, setExpenseDetailOpen] = useState(false);
  const [inspectedTransaction, setInspectedTransaction] = useState<Transaction | null>(null);

  const [budgetFormOpen, setBudgetFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetDetailOpen, setBudgetDetailOpen] = useState(false);
  const [inspectedBudget, setInspectedBudget] = useState<BudgetWithStats | null>(null);

  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryManagementOpen, setCategoryManagementOpen] = useState(false);

  // Budgets stats
  const budgetsWithStats = useMemo(() => {
    return budgets.map((b) => calculateBudgetStats(b, transactions));
  }, [budgets, transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (selectedCategory !== 'all' && tx.category_id !== selectedCategory) return false;
      if (!isDateInPeriod(tx.transaction_date, selectedPeriod)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = tx.title.toLowerCase().includes(q);
        const matchesDesc = tx.description ? tx.description.toLowerCase().includes(q) : false;
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [transactions, selectedCategory, selectedPeriod, searchQuery]);

  const totalFilteredAmount = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredTransactions]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {t('expenses.title', 'Gestion des dépenses')}
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (subtab === 'budgets') {
              setEditingBudget(null);
              setBudgetFormOpen(true);
            } else if (subtab === 'categories') {
              setEditingCategory(null);
              setCategoryFormOpen(true);
            } else {
              setEditingTransaction(null);
              setExpenseFormOpen(true);
            }
          }}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.addButtonText}>{t('common.add', 'Ajouter')}</Text>
        </TouchableOpacity>
      </View>

      {/* Subtabs Segmented Controls */}
      <View style={[styles.subtabsRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => setSubtab('list')}
          style={[
            styles.subtabBtn,
            subtab === 'list' && [styles.subtabBtnActive, { borderBottomColor: colors.primary }],
          ]}
        >
          <Receipt size={14} color={subtab === 'list' ? colors.primary : colors.textSecondary} />
          <Text
            style={[
              styles.subtabText,
              { color: subtab === 'list' ? colors.primary : colors.textSecondary },
            ]}
          >
            {t('expenses.subtabs.list')} ({transactions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSubtab('budgets')}
          style={[
            styles.subtabBtn,
            subtab === 'budgets' && [styles.subtabBtnActive, { borderBottomColor: colors.primary }],
          ]}
        >
          <Wallet size={14} color={subtab === 'budgets' ? colors.primary : colors.textSecondary} />
          <Text
            style={[
              styles.subtabText,
              { color: subtab === 'budgets' ? colors.primary : colors.textSecondary },
            ]}
          >
            {t('expenses.subtabs.budgets')} ({budgetsWithStats.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSubtab('categories')}
          style={[
            styles.subtabBtn,
            subtab === 'categories' && [styles.subtabBtnActive, { borderBottomColor: colors.primary }],
          ]}
        >
          <Layers size={14} color={subtab === 'categories' ? colors.primary : colors.textSecondary} />
          <Text
            style={[
              styles.subtabText,
              { color: subtab === 'categories' ? colors.primary : colors.textSecondary },
            ]}
          >
            {t('expenses.subtabs.categories')} ({categories.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* SUBTAB 1: TRANSACTIONS LIST */}
        {subtab === 'list' && (
          <View style={styles.tabContent}>
            {/* Search Input */}
            <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Search size={16} color={colors.textSecondary} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Rechercher une dépense..."
                placeholderTextColor={colors.textSecondary}
                style={[styles.searchInput, { color: colors.textPrimary }]}
              />
            </View>

            {/* Filter pills */}
            <View style={styles.periodRow}>
              {(['all', 'day', 'week', 'month'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setSelectedPeriod(p)}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: selectedPeriod === p ? colors.primary : colors.surfaceVariant,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      { color: selectedPeriod === p ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {p === 'all' ? 'Toutes' : p === 'day' ? 'Aujourd\'hui' : p === 'week' ? 'Semaine' : 'Mois'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Summary banner */}
            <View style={[styles.summaryBanner, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[styles.summaryCount, { color: colors.textSecondary }]}>
                {filteredTransactions.length} dépenses
              </Text>
              <Text style={[styles.summaryTotal, { color: colors.textPrimary }]}>
                {formatCurrency(totalFilteredAmount, settings.currency)}
              </Text>
            </View>

            {/* List */}
            {filteredTransactions.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Receipt size={32} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t('expenses.noExpensesFilter')}
                </Text>
              </View>
            ) : (
              <View style={[styles.txContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {filteredTransactions.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.category_id) || {
                    id: 'cat_default',
                    name: 'Autres',
                    icon: 'MoreHorizontal',
                    color: '#64748B',
                  };
                  const linkedBudget = budgets.find((b) => b.id === tx.budget_id);

                  return (
                    <TouchableOpacity
                      key={tx.id}
                      onPress={() => {
                        setInspectedTransaction(tx);
                        setExpenseDetailOpen(true);
                      }}
                      style={[styles.txItem, { borderBottomColor: colors.border }]}
                      activeOpacity={0.7}
                    >
                      <View style={styles.txLeft}>
                        <View style={[styles.txIconWrap, { backgroundColor: `${cat.color}20` }]}>
                          <CategoryIcon name={cat.icon} size={18} color={cat.color} />
                        </View>
                        <View>
                          <Text style={[styles.txTitle, { color: colors.textPrimary }]}>
                            {tx.title}
                          </Text>
                          <Text style={[styles.txMeta, { color: colors.textSecondary }]}>
                            {cat.name} • {formatDate(tx.transaction_date, i18n.language)}
                            {linkedBudget ? ` • ${linkedBudget.name}` : ''}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.txRight}>
                        <Text style={[styles.txAmount, { color: colors.textPrimary }]}>
                          -{formatCurrency(tx.amount, settings.currency)}
                        </Text>
                        <ChevronRight size={14} color={colors.textSecondary} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* SUBTAB 2: BUDGETS */}
        {subtab === 'budgets' && (
          <View style={styles.tabContent}>
            {budgetsWithStats.map((budget) => (
              <TouchableOpacity
                key={budget.id}
                onPress={() => {
                  setInspectedBudget(budget);
                  setBudgetDetailOpen(true);
                }}
                style={[styles.budgetCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                activeOpacity={0.8}
              >
                <View style={styles.budgetHeader}>
                  <View>
                    <Text style={[styles.budgetName, { color: colors.textPrimary }]}>
                      {budget.name}
                    </Text>
                    <Text style={[styles.budgetDates, { color: colors.textSecondary }]}>
                      {formatDate(budget.start_date, i18n.language)} - {formatDate(budget.end_date, i18n.language)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.consumedBadge,
                      {
                        backgroundColor: budget.is_over_budget
                          ? '#FEE2E2'
                          : budget.is_threshold_reached
                          ? '#FEF3C7'
                          : colors.primaryContainer,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.consumedBadgeText,
                        {
                          color: budget.is_over_budget
                            ? colors.danger
                            : budget.is_threshold_reached
                            ? colors.warning
                            : colors.primary,
                        },
                      ]}
                    >
                      {Math.round(budget.consumed_percentage)} %
                    </Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={[styles.progressBarTrack, { backgroundColor: colors.surfaceVariant }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(Math.max(budget.consumed_percentage, 0), 100)}%`,
                        backgroundColor: budget.is_over_budget
                          ? colors.danger
                          : budget.is_threshold_reached
                          ? colors.warning
                          : colors.primary,
                      },
                    ]}
                  />
                </View>

                {/* 3 cols */}
                <View style={styles.budgetStatsRow}>
                  <View>
                    <Text style={[styles.budgetStatLabel, { color: colors.textSecondary }]}>{t('budgets.amount')}</Text>
                    <Text style={[styles.budgetStatVal, { color: colors.textPrimary }]}>
                      {formatCurrency(budget.amount, settings.currency)}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.budgetStatLabel, { color: colors.textSecondary }]}>{t('dashboard.totalSpent')}</Text>
                    <Text style={[styles.budgetStatVal, { color: colors.textPrimary }]}>
                      {formatCurrency(budget.total_expenses, settings.currency)}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.budgetStatLabel, { color: colors.textSecondary }]}>{t('dashboard.remainingBudget')}</Text>
                    <Text
                      style={[
                        styles.budgetStatValBold,
                        {
                          color: budget.is_over_budget
                            ? colors.danger
                            : budget.is_threshold_reached
                            ? colors.warning
                            : colors.primary,
                        },
                      ]}
                    >
                      {formatCurrency(budget.remaining_amount, settings.currency)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* SUBTAB 3: CATEGORIES */}
        {subtab === 'categories' && (
          <View style={styles.tabContent}>
            <View style={[styles.txContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {categories.map((c) => {
                const count = transactions.filter((t) => t.category_id === c.id).length;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => {
                      setEditingCategory(c);
                      setCategoryFormOpen(true);
                    }}
                    style={[styles.txItem, { borderBottomColor: colors.border }]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.txLeft}>
                      <View style={[styles.txIconWrap, { backgroundColor: `${c.color}20` }]}>
                        <CategoryIcon name={c.icon} size={18} color={c.color} />
                      </View>
                      <View>
                        <Text style={[styles.txTitle, { color: colors.textPrimary }]}>
                          {c.name} {c.is_default ? '(Défaut)' : ''} {!c.is_active ? '(Désactivée)' : ''}
                        </Text>
                        <Text style={[styles.txMeta, { color: colors.textSecondary }]}>
                          {count} dépenses associées
                        </Text>
                      </View>
                    </View>

                    <ChevronRight size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <ExpenseFormModal
        isOpen={expenseFormOpen}
        onClose={() => setExpenseFormOpen(false)}
        onSubmit={(data) => {
          if (editingTransaction) updateTransaction(editingTransaction.id, data);
          else createTransaction(data);
        }}
        initialData={editingTransaction}
        budgets={budgets}
        categories={categories}
        currency={settings.currency}
        defaultBudgetId={activeBudgetId}
      />

      <ExpenseDetailModal
        isOpen={expenseDetailOpen}
        onClose={() => setExpenseDetailOpen(false)}
        transaction={inspectedTransaction}
        budget={budgets.find((b) => b.id === inspectedTransaction?.budget_id)}
        category={categories.find((c) => c.id === inspectedTransaction?.category_id)}
        currency={settings.currency}
        onEdit={(tx) => {
          setExpenseDetailOpen(false);
          setEditingTransaction(tx);
          setExpenseFormOpen(true);
        }}
        onDelete={(id) => {
          deleteTransaction(id);
          setExpenseDetailOpen(false);
        }}
      />

      <BudgetFormModal
        isOpen={budgetFormOpen}
        onClose={() => setBudgetFormOpen(false)}
        onSubmit={(data) => {
          if (editingBudget) updateBudget(editingBudget.id, data);
          else createBudget(data);
        }}
        initialData={editingBudget}
        currency={settings.currency}
      />

      <BudgetDetailModal
        isOpen={budgetDetailOpen}
        onClose={() => setBudgetDetailOpen(false)}
        budget={inspectedBudget}
        transactions={transactions}
        categories={categories}
        currency={settings.currency}
        onEdit={(b) => {
          setBudgetDetailOpen(false);
          setEditingBudget(b);
          setBudgetFormOpen(true);
        }}
        onDelete={(id) => {
          deleteBudget(id);
          setBudgetDetailOpen(false);
        }}
        onSelectTransaction={(tx) => {
          setBudgetDetailOpen(false);
          setInspectedTransaction(tx);
          setExpenseDetailOpen(true);
        }}
      />

      <CategoryFormModal
        isOpen={categoryFormOpen}
        onClose={() => setCategoryFormOpen(false)}
        onSubmit={(data) => {
          if (editingCategory) updateCategory(editingCategory.id, data);
          else createCategory(data);
        }}
        initialData={editingCategory}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  subtabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  subtabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subtabBtnActive: {},
  subtabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  tabContent: {
    gap: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  summaryCount: {
    fontSize: 11,
    fontWeight: '600',
  },
  summaryTotal: {
    fontSize: 13,
    fontWeight: '800',
  },
  txContainer: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 0.5,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  txIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  txMeta: {
    fontSize: 10,
  },
  txRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  txAmount: {
    fontSize: 12,
    fontWeight: '800',
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
  },
  budgetCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 10,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetName: {
    fontSize: 14,
    fontWeight: '800',
  },
  budgetDates: {
    fontSize: 10,
    marginTop: 2,
  },
  consumedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  consumedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  budgetStatLabel: {
    fontSize: 9,
  },
  budgetStatVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  budgetStatValBold: {
    fontSize: 12,
    fontWeight: '900',
  },
});
