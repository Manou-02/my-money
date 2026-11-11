import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Filter,
  Layers,
  Plus,
  Receipt,
  Search,
  Wallet,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Budget,
  BudgetWithStats,
  Category,
  CurrencyCode,
  TimePeriodFilter,
  Transaction,
} from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate, isDateInPeriod } from '../../utils/dates';
import { CategoryIcon } from '../common/CategoryIcon';

interface ExpenseListProps {
  transactions: Transaction[];
  budgetsWithStats: BudgetWithStats[];
  categories: Category[];
  currency: CurrencyCode;
  onSelectTransaction: (t: Transaction) => void;
  onAddExpense: () => void;
  onCreateBudget: () => void;
  onInspectBudget: (b: BudgetWithStats) => void;
  onManageCategories: () => void;
  onCreateCategory: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  transactions,
  budgetsWithStats,
  categories,
  currency,
  onSelectTransaction,
  onAddExpense,
  onCreateBudget,
  onInspectBudget,
  onManageCategories,
  onCreateCategory,
}) => {
  const { t, i18n } = useTranslation();

  const [subtab, setSubtab] = useState<'list' | 'budgets' | 'categories'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriodFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Category filter
      if (selectedCategory !== 'all' && tx.category_id !== selectedCategory) {
        return false;
      }
      // Period filter
      if (!isDateInPeriod(tx.transaction_date, selectedPeriod)) {
        return false;
      }
      // Search query
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
    <div className="space-y-4 pb-20">
      {/* Subtab Segmented Controls: Dépenses / Prévisions / Catégories */}
      <div className="flex bg-slate-100 dark:bg-[#181C22] p-1 rounded-2xl border border-slate-200/60 dark:border-[#2E3642]">
        <button
          onClick={() => setSubtab('list')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            subtab === 'list'
              ? 'bg-white dark:bg-[#222730] text-[#2563EB] dark:text-[#3B82F6] shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Receipt size={14} />
          <span>{t('expenses.subtabs.list')}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/60 dark:bg-slate-700">
            {transactions.length}
          </span>
        </button>

        <button
          onClick={() => setSubtab('budgets')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            subtab === 'budgets'
              ? 'bg-white dark:bg-[#222730] text-[#2563EB] dark:text-[#3B82F6] shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Wallet size={14} />
          <span>{t('expenses.subtabs.budgets')}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/60 dark:bg-slate-700">
            {budgetsWithStats.length}
          </span>
        </button>

        <button
          onClick={() => setSubtab('categories')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            subtab === 'categories'
              ? 'bg-white dark:bg-[#222730] text-[#2563EB] dark:text-[#3B82F6] shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Layers size={14} />
          <span>{t('expenses.subtabs.categories')}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/60 dark:bg-slate-700">
            {categories.length}
          </span>
        </button>
      </div>

      {/* --- SUBTAB 1: EXPENSE TRANSACTIONS LIST --- */}
      {subtab === 'list' && (
        <div className="space-y-3">
          {/* Search and Filters Bar */}
          <div className="space-y-2">
            {/* Search Input */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une dépense..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-[#181C22] border border-slate-200 dark:border-[#2E3642] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Category & Filter Period Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {/* Category dropdown */}
              <div className="shrink-0 flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500">
                  <Filter size={12} className="inline mr-1" />
                </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl text-xs bg-white dark:bg-[#181C22] border border-slate-200 dark:border-[#2E3642] text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                >
                  <option value="all">{t('common.all')} ({t('expenses.subtabs.categories')})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Period Selector Pills */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#181C22] p-0.5 rounded-xl shrink-0">
                <button
                  onClick={() => setSelectedPeriod('all')}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg ${
                    selectedPeriod === 'all'
                      ? 'bg-white dark:bg-[#222730] text-[#2563EB] dark:text-[#3B82F6] shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t('common.all')}
                </button>
                <button
                  onClick={() => setSelectedPeriod('day')}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg ${
                    selectedPeriod === 'day'
                      ? 'bg-white dark:bg-[#222730] text-[#2563EB] dark:text-[#3B82F6] shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t('common.today')}
                </button>
                <button
                  onClick={() => setSelectedPeriod('week')}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg ${
                    selectedPeriod === 'week'
                      ? 'bg-white dark:bg-[#222730] text-[#2563EB] dark:text-[#3B82F6] shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t('common.thisWeek')}
                </button>
                <button
                  onClick={() => setSelectedPeriod('month')}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg ${
                    selectedPeriod === 'month'
                      ? 'bg-white dark:bg-[#222730] text-[#2563EB] dark:text-[#3B82F6] shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t('common.thisMonth')}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Summary Strip */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#181C22] text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span>
              {filteredTransactions.length} {t('expenses.title').toLowerCase()}
            </span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100">
              {formatCurrency(totalFilteredAmount, currency)}
            </span>
          </div>

          {/* List of filtered transactions */}
          {filteredTransactions.length === 0 ? (
            <div className="rounded-3xl p-8 bg-white dark:bg-[#181C22] border border-slate-200 dark:border-[#2E3642] text-center">
              <Receipt size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                {t('expenses.noExpensesFilter')}
              </p>
              <button
                onClick={onAddExpense}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] dark:bg-[#3B82F6] text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-transform"
              >
                <Plus size={15} />
                {t('expenses.addExpense')}
              </button>
            </div>
          ) : (
            <div className="rounded-3xl bg-white dark:bg-[#181C22] border border-slate-200 dark:border-[#2E3642] divide-y divide-slate-100 dark:divide-[#222730] overflow-hidden shadow-xs">
              {filteredTransactions.map((tx) => {
                const cat = categories.find((c) => c.id === tx.category_id) || {
                  id: 'cat_default',
                  name: 'Autres',
                  icon: 'MoreHorizontal',
                  color: '#64748B',
                  is_default: true,
                  is_active: true,
                  created_at: '',
                  updated_at: '',
                };
                const linkedBudget = budgetsWithStats.find((b) => b.id === tx.budget_id);

                return (
                  <button
                    key={tx.id}
                    onClick={() => onSelectTransaction(tx)}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-[#222730]/50 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} size={20} color={cat.color} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {tx.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="truncate max-w-[80px]">{cat.name}</span>
                          <span>•</span>
                          <span>{formatDate(tx.transaction_date, i18n.language)}</span>
                          {linkedBudget && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[90px] font-medium text-blue-600 dark:text-blue-400">
                                {linkedBudget.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-black text-slate-900 dark:text-slate-100 shrink-0">
                      -{formatCurrency(tx.amount, currency)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- SUBTAB 2: BUDGET FORECASTS --- */}
      {subtab === 'budgets' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">
              {budgetsWithStats.length} {t('budgets.title').toLowerCase()}
            </span>
            <button
              onClick={onCreateBudget}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2563EB] dark:bg-[#3B82F6] text-white text-xs font-bold active:scale-95 transition-transform"
            >
              <Plus size={14} />
              {t('budgets.create')}
            </button>
          </div>

          <div className="space-y-3">
            {budgetsWithStats.map((budget) => (
              <div
                key={budget.id}
                onClick={() => onInspectBudget(budget)}
                className="p-4 rounded-3xl bg-white dark:bg-[#181C22] border border-slate-200 dark:border-[#2E3642] shadow-xs hover:border-blue-400 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      {budget.name}
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar size={12} />
                      {formatDate(budget.start_date, i18n.language)} - {formatDate(budget.end_date, i18n.language)}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                      budget.is_over_budget
                        ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                        : budget.is_threshold_reached
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                    }`}
                  >
                    {Math.round(budget.consumed_percentage)} %
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-100 dark:bg-[#222730] rounded-full overflow-hidden my-2.5">
                  <div
                    className={`h-full rounded-full ${
                      budget.is_over_budget
                        ? 'bg-red-500'
                        : budget.is_threshold_reached
                        ? 'bg-amber-500'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(budget.consumed_percentage, 100)}%` }}
                  />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t('budgets.amount')}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {formatCurrency(budget.amount, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t('dashboard.totalSpent')}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {formatCurrency(budget.total_expenses, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t('dashboard.remainingBudget')}</span>
                    <span
                      className={`font-black ${
                        budget.is_over_budget
                          ? 'text-red-600'
                          : budget.is_threshold_reached
                          ? 'text-amber-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {formatCurrency(budget.remaining_amount, currency)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SUBTAB 3: CATEGORIES --- */}
      {subtab === 'categories' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">
              {categories.length} {t('categories.title').toLowerCase()}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onCreateCategory}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2563EB] dark:bg-[#3B82F6] text-white text-xs font-bold active:scale-95 transition-transform"
              >
                <Plus size={14} />
                {t('categories.add')}
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white dark:bg-[#181C22] border border-slate-200 dark:border-[#2E3642] divide-y divide-slate-100 dark:divide-[#222730] overflow-hidden">
            {categories.map((c) => {
              const count = transactions.filter((t) => t.category_id === c.id).length;
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-[#222730]/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${c.color}20`, color: c.color }}
                    >
                      <CategoryIcon name={c.icon} size={20} color={c.color} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {c.name}
                        </h4>
                        {c.is_default && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {t('categories.defaultBadge')}
                          </span>
                        )}
                        {!c.is_active && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300">
                            {t('categories.inactive')}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {count} dépenses enregistrées
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onManageCategories}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {t('common.edit')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
