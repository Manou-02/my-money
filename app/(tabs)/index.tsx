import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import {
  AlertTriangle,
  AlertCircle,
  Plus,
  Calendar,
  ChevronRight,
  TrendingDown,
  PieChart as PieIcon,
  BarChart3,
  Layers,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useBudgetStore } from '../../src/stores/budgetStore';
import { useCategoryStore } from '../../src/stores/categoryStore';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { calculateBudgetStats, calculateMonthlyStats } from '../../src/utils/budgetCalculations';
import { formatCurrency } from '../../src/utils/currency';
import { formatDate } from '../../src/utils/dates';
import { themeColors } from '../../src/constants/theme';
import { CategoryIcon } from '../../src/components/native/CategoryIcon';
import { Budget, BudgetWithStats, Transaction } from '../../src/types';

// Modals
import { BudgetFormModal } from '../../src/components/budgets/BudgetFormModal';
import { BudgetDetailModal } from '../../src/components/budgets/BudgetDetailModal';
import { BudgetListModal } from '../../src/components/budgets/BudgetListModal';
import { ExpenseFormModal } from '../../src/components/expenses/ExpenseFormModal';
import { ExpenseDetailModal } from '../../src/components/expenses/ExpenseDetailModal';

export default function DashboardScreen() {
  const { t, i18n } = useTranslation();
  const { settings } = useSettingsStore();
  const { budgets, activeBudgetId, createBudget, updateBudget, deleteBudget, setActiveBudgetId } =
    useBudgetStore();
  const { categories } = useCategoryStore();
  const { transactions, createTransaction, updateTransaction, deleteTransaction } =
    useTransactionStore();

  const isDark = settings.theme === 'dark';
  const colors = isDark ? themeColors.dark : themeColors.light;

  // Chart state
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [chartType, setChartType] = useState<'category' | 'evolution'>('category');

  // Modals state
  const [budgetFormOpen, setBudgetFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetDetailOpen, setBudgetDetailOpen] = useState(false);
  const [inspectedBudget, setInspectedBudget] = useState<BudgetWithStats | null>(null);
  const [budgetListOpen, setBudgetListOpen] = useState(false);

  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [expenseDetailOpen, setExpenseDetailOpen] = useState(false);
  const [inspectedTransaction, setInspectedTransaction] = useState<Transaction | null>(null);

  // Computations
  const budgetsWithStats = useMemo(() => {
    return budgets.map((b) => calculateBudgetStats(b, transactions));
  }, [budgets, transactions]);

  const activeBudget = useMemo(() => {
    const found = budgetsWithStats.find((b) => b.id === activeBudgetId);
    return found || (budgetsWithStats.length > 0 ? budgetsWithStats[0] : null);
  }, [budgetsWithStats, activeBudgetId]);

  const monthlyStats = useMemo(() => {
    return calculateMonthlyStats(
      budgets,
      transactions,
      settings.monthly_threshold_enabled,
      settings.monthly_threshold_percentage
    );
  }, [budgets, transactions, settings.monthly_threshold_enabled, settings.monthly_threshold_percentage]);

  // Threshold alerts
  const budgetAlerts = useMemo(() => {
    return budgetsWithStats
      .filter((b) => b.is_threshold_reached || b.is_over_budget)
      .map((b) => ({
        budget: b,
        isOverBudget: b.is_over_budget,
      }));
  }, [budgetsWithStats]);

  // Category breakdown for chart
  const categoryStats = useMemo(() => {
    const map = new Map<string, number>();
    let total = 0;
    transactions.forEach((tx) => {
      total += tx.amount;
      map.set(tx.category_id, (map.get(tx.category_id) || 0) + tx.amount);
    });

    return Array.from(map.entries())
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId) || {
          id: catId,
          name: 'Autres',
          icon: 'MoreHorizontal',
          color: '#64748B',
        };
        const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
        return { category: cat, amount, percentage };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, categories]);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.brandBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.brandBadgeText}>KB</Text>
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              {t('dashboard.title', 'Tableau de bord')}
            </Text>
            <Text style={[styles.offlineText, { color: colors.success }]}>
              ● SQLite Offline (SDK 57)
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            setEditingTransaction(null);
            setExpenseFormOpen(true);
          }}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.addButtonText}>{t('expenses.addExpense', 'Dépense')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* A. GRANDE CARTE D'ALERTE DE SEUIL (Visible uniquement si déclenchée) */}
        {budgetAlerts.map(({ budget, isOverBudget }) => (
          <View
            key={budget.id}
            style={[
              styles.alertCard,
              {
                borderColor: isOverBudget ? colors.danger : colors.warning,
                backgroundColor: isOverBudget ? (isDark ? '#3E1818' : '#FEF2F2') : (isDark ? '#3D2A12' : '#FFFBEB'),
              },
            ]}
          >
            <View style={styles.alertHeader}>
              <View
                style={[
                  styles.alertIconWrapper,
                  { backgroundColor: isOverBudget ? colors.danger : colors.warning },
                ]}
              >
                {isOverBudget ? (
                  <AlertCircle size={22} color="#FFFFFF" />
                ) : (
                  <AlertTriangle size={22} color="#FFFFFF" />
                )}
              </View>
              <View style={styles.alertHeaderText}>
                <Text
                  style={[
                    styles.alertTitle,
                    { color: isOverBudget ? colors.danger : colors.warning },
                  ]}
                >
                  {isOverBudget
                    ? t('dashboard.alertExceededTitle', 'ATTENTION : BUDGET DÉPASSÉ !')
                    : t('dashboard.alertThresholdTitle', 'ATTENTION : SEUIL DE BUDGET ATTEINT !')}
                </Text>
                <Text style={[styles.alertBudgetTag, { color: colors.textSecondary }]}>
                  {budget.name} • {Math.round(budget.consumed_percentage)}% consommé
                </Text>
              </View>
            </View>

            <Text style={[styles.alertMessage, { color: colors.textPrimary }]}>
              {isOverBudget
                ? t('dashboard.alertExceededMessage', 'Vos dépenses dépassent le montant alloué à cette prévision.')
                : t('dashboard.alertThresholdMessage', 'Votre budget restant a atteint le seuil d\'alerte configuré.')}
            </Text>

            <View style={[styles.alertGrid, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.alertCol}>
                <Text style={[styles.alertLabel, { color: colors.textSecondary }]}>{t('dashboard.initialBudget')}</Text>
                <Text style={[styles.alertValue, { color: colors.textPrimary }]}>
                  {formatCurrency(budget.amount, settings.currency)}
                </Text>
              </View>
              <View style={styles.alertCol}>
                <Text style={[styles.alertLabel, { color: colors.textSecondary }]}>{t('dashboard.totalSpent')}</Text>
                <Text style={[styles.alertValue, { color: colors.textPrimary }]}>
                  {formatCurrency(budget.total_expenses, settings.currency)}
                </Text>
              </View>
              <View style={styles.alertCol}>
                <Text style={[styles.alertLabel, { color: colors.textSecondary }]}>{t('dashboard.remainingBudget')}</Text>
                <Text
                  style={[
                    styles.alertValueBold,
                    { color: isOverBudget ? colors.danger : colors.warning },
                  ]}
                >
                  {formatCurrency(budget.remaining_amount, settings.currency)}
                </Text>
              </View>
              <View style={styles.alertCol}>
                <Text style={[styles.alertLabel, { color: colors.textSecondary }]}>{t('dashboard.configuredThreshold')}</Text>
                <Text style={[styles.alertValue, { color: colors.textPrimary }]}>
                  {budget.threshold_percentage} %
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* B. CARTE PRINCIPALE : SITUATION DU BUDGET */}
        {activeBudget ? (
          <View style={[styles.mainCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.mainCardHeader}>
              <TouchableOpacity
                onPress={() => setBudgetListOpen(true)}
                style={styles.budgetSelectorBtn}
                activeOpacity={0.7}
              >
                <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
                <View>
                  <Text style={[styles.mainCardSub, { color: colors.textSecondary }]}>
                    {t('dashboard.activeBudget', 'Prévision active')}
                  </Text>
                  <Text style={[styles.mainCardTitle, { color: colors.textPrimary }]}>
                    {activeBudget.name}
                  </Text>
                </View>
              </TouchableOpacity>

              <Text style={[styles.periodTag, { backgroundColor: colors.surfaceVariant, color: colors.textSecondary }]}>
                {formatDate(activeBudget.start_date, i18n.language)} - {formatDate(activeBudget.end_date, i18n.language)}
              </Text>
            </View>

            {/* Remaining amount */}
            <View style={styles.remainingSection}>
              <Text style={[styles.remainingLabel, { color: colors.textSecondary }]}>
                {t('dashboard.remainingBudget', 'Budget restant')}
              </Text>
              <View style={styles.remainingRow}>
                <Text
                  style={[
                    styles.remainingAmount,
                    {
                      color: activeBudget.is_over_budget
                        ? colors.danger
                        : activeBudget.is_threshold_reached
                        ? colors.warning
                        : colors.textPrimary,
                    },
                  ]}
                >
                  {formatCurrency(activeBudget.remaining_amount, settings.currency)}
                </Text>
                <View
                  style={[
                    styles.consumedBadge,
                    {
                      backgroundColor: activeBudget.is_over_budget
                        ? '#FEE2E2'
                        : activeBudget.is_threshold_reached
                        ? '#FEF3C7'
                        : colors.primaryContainer,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.consumedBadgeText,
                      {
                        color: activeBudget.is_over_budget
                          ? colors.danger
                          : activeBudget.is_threshold_reached
                          ? colors.warning
                          : colors.primary,
                      },
                    ]}
                  >
                    {Math.round(activeBudget.consumed_percentage)} % {t('dashboard.consumed')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Progress bar */}
            <View style={[styles.progressBarTrack, { backgroundColor: colors.surfaceVariant }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(Math.max(activeBudget.consumed_percentage, 0), 100)}%`,
                    backgroundColor: activeBudget.is_over_budget
                      ? colors.danger
                      : activeBudget.is_threshold_reached
                      ? colors.warning
                      : colors.primary,
                  },
                ]}
              />
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: colors.surfaceVariant }]}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('dashboard.initialBudget')}</Text>
                <Text style={[styles.statVal, { color: colors.textPrimary }]}>
                  {formatCurrency(activeBudget.amount, settings.currency)}
                </Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: colors.surfaceVariant }]}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('dashboard.totalSpent')}</Text>
                <Text style={[styles.statVal, { color: colors.textPrimary }]}>
                  {formatCurrency(activeBudget.total_expenses, settings.currency)}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.emptyBudgetCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Calendar size={32} color={colors.primary} />
            <Text style={[styles.emptyBudgetTitle, { color: colors.textPrimary }]}>
              {t('dashboard.noActiveBudget')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setEditingBudget(null);
                setBudgetFormOpen(true);
              }}
              style={[styles.createFirstBudgetBtn, { backgroundColor: colors.primary }]}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.createFirstBudgetBtnText}>{t('dashboard.createNewBudget')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* C. GRAPHIQUES : REPARTITION & EVOLUTION */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              {t('dashboard.chartsTitle', 'Analyses des dépenses')}
            </Text>

            {/* Selector: Jour / Semaine / Mois */}
            <View style={[styles.periodPills, { backgroundColor: colors.surfaceVariant }]}>
              {(['day', 'week', 'month'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setChartPeriod(p)}
                  style={[
                    styles.periodPill,
                    chartPeriod === p && [styles.periodPillActive, { backgroundColor: colors.surface }],
                  ]}
                >
                  <Text
                    style={[
                      styles.periodPillText,
                      { color: chartPeriod === p ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    {p === 'day' ? 'Jour' : p === 'week' ? 'Semaine' : 'Mois'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Breakdown bars */}
          {categoryStats.length === 0 ? (
            <Text style={[styles.emptyChartText, { color: colors.textSecondary }]}>
              {t('common.noData')}
            </Text>
          ) : (
            <View style={styles.categoryList}>
              {categoryStats.slice(0, 4).map((item) => (
                <View key={item.category.id} style={styles.catRow}>
                  <View style={styles.catInfo}>
                    <View style={[styles.catIconWrap, { backgroundColor: `${item.category.color}20` }]}>
                      <CategoryIcon name={item.category.icon} size={14} color={item.category.color} />
                    </View>
                    <Text style={[styles.catName, { color: colors.textPrimary }]}>
                      {item.category.name}
                    </Text>
                  </View>

                  <View style={styles.catBarWrapper}>
                    <View style={[styles.catBarTrack, { backgroundColor: colors.surfaceVariant }]}>
                      <View
                        style={[
                          styles.catBarFill,
                          { width: `${item.percentage}%`, backgroundColor: item.category.color },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.catAmounts}>
                    <Text style={[styles.catAmountText, { color: colors.textPrimary }]}>
                      {formatCurrency(item.amount, settings.currency)}
                    </Text>
                    <Text style={[styles.catPctText, { color: colors.textSecondary }]}>
                      {item.percentage}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* D. DERNIERES DEPENSES */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              {t('dashboard.recentExpenses', 'Dernières dépenses')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setEditingTransaction(null);
                setExpenseFormOpen(true);
              }}
              style={styles.cardHeaderAction}
            >
              <Plus size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <Text style={[styles.emptyChartText, { color: colors.textSecondary }]}>
              {t('dashboard.noRecentExpenses')}
            </Text>
          ) : (
            <View style={styles.transactionsList}>
              {recentTransactions.map((tx) => {
                const cat = categories.find((c) => c.id === tx.category_id) || {
                  id: 'other',
                  name: 'Autres',
                  icon: 'MoreHorizontal',
                  color: '#64748B',
                };

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
      </ScrollView>

      {/* MODALS */}
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

      <BudgetListModal
        isOpen={budgetListOpen}
        onClose={() => setBudgetListOpen(false)}
        budgetsWithStats={budgetsWithStats}
        activeBudgetId={activeBudgetId}
        currency={settings.currency}
        onSelectBudget={(id) => setActiveBudgetId(id)}
        onCreateBudget={() => {
          setEditingBudget(null);
          setBudgetFormOpen(true);
        }}
        onInspectBudget={(b) => {
          setInspectedBudget(b);
          setBudgetDetailOpen(true);
        }}
      />

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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  offlineText: {
    fontSize: 10,
    fontWeight: '600',
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  alertCard: {
    borderWidth: 2,
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  alertIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertHeaderText: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  alertBudgetTag: {
    fontSize: 11,
    fontWeight: '600',
  },
  alertMessage: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  alertGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  alertCol: {
    width: '50%',
    paddingVertical: 3,
  },
  alertLabel: {
    fontSize: 10,
  },
  alertValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  alertValueBold: {
    fontSize: 12,
    fontWeight: '900',
  },
  mainCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mainCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  budgetSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  mainCardSub: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  mainCardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  periodTag: {
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  remainingSection: {
    marginBottom: 10,
  },
  remainingLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  remainingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  remainingAmount: {
    fontSize: 26,
    fontWeight: '900',
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
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 10,
  },
  statVal: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  emptyBudgetCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyBudgetTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  createFirstBudgetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  createFirstBudgetBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardHeaderAction: {
    padding: 4,
  },
  periodPills: {
    flexDirection: 'row',
    padding: 2,
    borderRadius: 8,
  },
  periodPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  periodPillActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  periodPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyChartText: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 14,
  },
  categoryList: {
    gap: 8,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 100,
  },
  catIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: {
    fontSize: 11,
    fontWeight: '700',
  },
  catBarWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  catBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  catAmounts: {
    alignItems: 'flex-end',
    width: 70,
  },
  catAmountText: {
    fontSize: 11,
    fontWeight: '700',
  },
  catPctText: {
    fontSize: 9,
    fontWeight: '600',
  },
  transactionsList: {
    gap: 2,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
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
});
