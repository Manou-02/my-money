import React, { useState } from 'react';
import { Calendar, Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BudgetWithStats, Category, CurrencyCode, Transaction } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { Modal } from '../common/Modal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { CategoryIcon } from '../common/CategoryIcon';

interface BudgetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: BudgetWithStats | null;
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyCode;
  onEdit: (budget: BudgetWithStats) => void;
  onDelete: (id: string) => void;
  onSelectTransaction: (t: Transaction) => void;
}

export const BudgetDetailModal: React.FC<BudgetDetailModalProps> = ({
  isOpen,
  onClose,
  budget,
  transactions,
  categories,
  currency,
  onEdit,
  onDelete,
  onSelectTransaction,
}) => {
  const { t, i18n } = useTranslation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!budget) return null;

  const budgetTransactions = transactions.filter((t) => t.budget_id === budget.id);

  const handleDelete = () => {
    onDelete(budget.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={budget.name}>
        <div className="space-y-4">
          {/* Status banner */}
          <div
            className={`p-3.5 rounded-2xl flex items-center justify-between ${
              budget.is_over_budget
                ? 'bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200 border border-red-200'
                : budget.is_threshold_reached
                ? 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 border border-amber-200'
                : 'bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200 border border-blue-200'
            }`}
          >
            <div>
              <span className="text-[11px] uppercase font-bold block opacity-75">
                {t('dashboard.remainingBudget')}
              </span>
              <span className="text-xl font-black">
                {formatCurrency(budget.remaining_amount, currency)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/70 dark:bg-black/30">
                {Math.round(budget.consumed_percentage)}% {t('dashboard.consumed')}
              </span>
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-slate-50 dark:bg-[#222730]/60 p-3.5 rounded-2xl space-y-2 text-xs border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">{t('budgets.amount')}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {formatCurrency(budget.amount, currency)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">{t('dashboard.totalSpent')}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {formatCurrency(budget.total_expenses, currency)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">{t('budgets.validityPeriod')}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Calendar size={13} />
                {formatDate(budget.start_date, i18n.language)} - {formatDate(budget.end_date, i18n.language)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400">{t('budgets.thresholdPercentage')}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {budget.threshold_enabled ? `${budget.threshold_percentage}% (${formatCurrency(budget.threshold_amount, currency)})` : 'Désactivé'}
              </span>
            </div>
          </div>

          {/* Associated Transactions */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              {t('expenses.title')} ({budgetTransactions.length})
            </h4>
            {budgetTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">{t('expenses.noExpenses')}</p>
            ) : (
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-[#222730]">
                {budgetTransactions.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.category_id);
                  return (
                    <button
                      key={tx.id}
                      onClick={() => {
                        onClose();
                        onSelectTransaction(tx);
                      }}
                      className="w-full flex items-center justify-between py-2 text-left hover:bg-slate-50 dark:hover:bg-[#222730]/50 px-1 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <CategoryIcon name={cat?.icon || 'MoreHorizontal'} size={15} color={cat?.color} />
                        <div>
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                            {tx.title}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDate(tx.transaction_date, i18n.language)}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        -{formatCurrency(tx.amount, currency)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#222730]">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <Trash2 size={15} />
              {t('common.delete')}
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onEdit(budget);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100"
              >
                <Edit size={15} />
                {t('common.edit')}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title={t('budgets.deleteConfirmTitle')}
        message={t('budgets.deleteConfirmMessage')}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};
