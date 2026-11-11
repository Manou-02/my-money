import React from 'react';
import { ChevronRight, Clock, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Category, CurrencyCode, Transaction } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { CategoryIcon } from '../common/CategoryIcon';

interface RecentExpensesProps {
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyCode;
  onSelectTransaction: (t: Transaction) => void;
  onAddExpense: () => void;
  onViewAll: () => void;
}

export const RecentExpenses: React.FC<RecentExpensesProps> = ({
  transactions,
  categories,
  currency,
  onSelectTransaction,
  onAddExpense,
  onViewAll,
}) => {
  const { t, i18n } = useTranslation();
  const recent = transactions.slice(0, 5);

  return (
    <div className="rounded-3xl p-5 bg-white dark:bg-[#181C22] border border-slate-200/80 dark:border-[#2E3642] shadow-sm mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#222730] mb-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[#2563EB] dark:text-[#3B82F6]" />
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
            {t('dashboard.recentExpenses')}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddExpense}
            className="p-1 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
            title={t('expenses.addExpense')}
          >
            <Plus size={18} />
          </button>
          {transactions.length > 5 && (
            <button
              onClick={onViewAll}
              className="text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6] hover:underline"
            >
              {t('dashboard.seeAll')}
            </button>
          )}
        </div>
      </div>

      {recent.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
            {t('dashboard.noRecentExpenses')}
          </p>
          <button
            onClick={onAddExpense}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-[#3B82F6]"
          >
            <Plus size={14} />
            {t('expenses.addExpense')}
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-[#222730]">
          {recent.map((tx) => {
            const category = categories.find((c) => c.id === tx.category_id) || {
              id: 'cat_default',
              name: 'Autres',
              icon: 'MoreHorizontal',
              color: '#64748B',
              is_default: true,
              is_active: true,
              created_at: '',
              updated_at: '',
            };

            return (
              <button
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="w-full flex items-center justify-between py-3 group text-left hover:bg-slate-50/80 dark:hover:bg-[#222730]/40 px-2 -mx-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: `${category.color}20`, color: category.color }}
                  >
                    <CategoryIcon name={category.icon} size={20} color={category.color} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tx.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="truncate max-w-[100px]">{category.name}</span>
                      <span>•</span>
                      <span>{formatDate(tx.transaction_date, i18n.language)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                    -{formatCurrency(tx.amount, currency)}
                  </span>
                  <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
