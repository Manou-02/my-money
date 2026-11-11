import React from 'react';
import { Calendar, ChevronDown, PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BudgetWithStats, CurrencyCode } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';

interface MainBudgetCardProps {
  budget: BudgetWithStats | null;
  budgetsCount: number;
  currency: CurrencyCode;
  onOpenBudgetSelector: () => void;
  onCreateBudget: () => void;
}

export const MainBudgetCard: React.FC<MainBudgetCardProps> = ({
  budget,
  budgetsCount,
  currency,
  onOpenBudgetSelector,
  onCreateBudget,
}) => {
  const { t, i18n } = useTranslation();

  if (!budget) {
    return (
      <div className="rounded-3xl p-6 bg-white dark:bg-[#181C22] border border-slate-200 dark:border-[#2E3642] shadow-sm text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center mb-3">
          <Calendar size={28} />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
          {t('dashboard.noActiveBudget')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs mx-auto">
          {t('dashboard.createBudgetPrompt')}
        </p>
        <button
          onClick={onCreateBudget}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] dark:bg-[#3B82F6] text-white font-semibold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-transform"
        >
          <PlusCircle size={16} />
          {t('dashboard.createNewBudget')}
        </button>
      </div>
    );
  }

  const percentage = Math.min(Math.max(budget.consumed_percentage, 0), 100);
  const isOver = budget.is_over_budget;
  const isNear = budget.is_threshold_reached && !isOver;

  // Determine progress bar color
  let progressColor = 'bg-[#2563EB] dark:bg-[#3B82F6]';
  if (isOver) {
    progressColor = 'bg-[#EF4444] dark:bg-[#F87171]';
  } else if (isNear) {
    progressColor = 'bg-[#F59E0B] dark:bg-[#FBBF24]';
  }

  return (
    <div className="rounded-3xl p-5 bg-white dark:bg-[#181C22] border border-slate-200/80 dark:border-[#2E3642] shadow-sm relative overflow-hidden mb-5">
      {/* Top Banner with Budget Switcher */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#222730] mb-4">
        <button
          onClick={onOpenBudgetSelector}
          className="flex items-center gap-2 group text-left max-w-[80%]"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] dark:bg-[#3B82F6] shrink-0 animate-pulse" />
          <div className="truncate">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              {t('dashboard.mainCardTitle')}
            </span>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {budget.name}
              </h2>
              {budgetsCount > 1 && (
                <ChevronDown size={16} className="text-slate-400 group-hover:translate-y-0.5 transition-transform" />
              )}
            </div>
          </div>
        </button>

        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#222730] text-slate-600 dark:text-slate-400 whitespace-nowrap">
          {formatDate(budget.start_date, i18n.language)} - {formatDate(budget.end_date, i18n.language)}
        </span>
      </div>

      {/* Main Remaining Amount Display */}
      <div className="mb-4">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
          {t('dashboard.remainingBudget')}
        </span>
        <div className="flex items-baseline justify-between">
          <span
            className={`text-2xl sm:text-3xl font-black tracking-tight ${
              isOver
                ? 'text-[#EF4444] dark:text-[#F87171]'
                : isNear
                ? 'text-[#F59E0B] dark:text-[#FBBF24]'
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {formatCurrency(budget.remaining_amount, currency)}
          </span>
          <span
            className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
              isOver
                ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                : isNear
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
            }`}
          >
            {Math.round(budget.consumed_percentage)} % {t('dashboard.consumed')}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 mb-5">
        <div className="w-full h-3 bg-slate-100 dark:bg-[#222730] rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500 px-0.5">
          <span>0 %</span>
          {budget.threshold_enabled && (
            <span className="text-amber-500">
              {t('budgets.thresholdPercentage')}: {budget.threshold_percentage}%
            </span>
          )}
          <span>100 %</span>
        </div>
      </div>

      {/* Key Financial Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-[#222730]">
        <div className="p-3 rounded-2xl bg-[#EFF6FF] dark:bg-[#1E3A5F]/40 border border-blue-100 dark:border-blue-900/30">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
            {t('dashboard.initialBudget')}
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(budget.amount, currency)}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#222730]/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
            {t('dashboard.totalSpent')}
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(budget.total_expenses, currency)}
          </span>
        </div>
      </div>
    </div>
  );
};
