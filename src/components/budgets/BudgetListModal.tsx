import React from 'react';
import { Check, Plus, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BudgetWithStats, CurrencyCode } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { Modal } from '../common/Modal';

interface BudgetListModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetsWithStats: BudgetWithStats[];
  activeBudgetId: string | null;
  currency: CurrencyCode;
  onSelectBudget: (id: string) => void;
  onCreateBudget: () => void;
  onInspectBudget: (b: BudgetWithStats) => void;
}

export const BudgetListModal: React.FC<BudgetListModalProps> = ({
  isOpen,
  onClose,
  budgetsWithStats,
  activeBudgetId,
  currency,
  onSelectBudget,
  onCreateBudget,
  onInspectBudget,
}) => {
  const { t, i18n } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('budgets.title')}>
      <div className="space-y-3">
        <button
          onClick={() => {
            onClose();
            onCreateBudget();
          }}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#EFF6FF] dark:bg-[#1E3A5F]/40 border-2 border-dashed border-blue-300 dark:border-blue-800 text-[#2563EB] dark:text-[#3B82F6] font-bold text-xs hover:bg-blue-100 transition-colors"
        >
          <Plus size={16} />
          {t('budgets.create')}
        </button>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pt-1">
          {budgetsWithStats.map((b) => {
            const isActive = b.id === activeBudgetId;
            return (
              <div
                key={b.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isActive
                    ? 'border-[#2563EB] dark:border-[#3B82F6] bg-blue-50/50 dark:bg-blue-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-[#2E3642] bg-white dark:bg-[#181C22] hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <button
                    onClick={() => {
                      onSelectBudget(b.id);
                      onClose();
                    }}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {b.name}
                      </h4>
                      {isActive && (
                        <span className="p-0.5 rounded-full bg-blue-600 text-white">
                          <Check size={12} />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <Calendar size={12} />
                      <span>
                        {formatDate(b.start_date, i18n.language)} - {formatDate(b.end_date, i18n.language)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block">
                          {t('dashboard.initialBudget')}
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {formatCurrency(b.amount, currency)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">
                          {t('dashboard.remainingBudget')}
                        </span>
                        <span
                          className={`font-bold ${
                            b.is_over_budget
                              ? 'text-red-600'
                              : b.is_threshold_reached
                              ? 'text-amber-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {formatCurrency(b.remaining_amount, currency)}
                        </span>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onInspectBudget(b);
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg bg-slate-100 dark:bg-[#222730]"
                  >
                    {t('common.details')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
