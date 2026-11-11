import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BudgetWithStats, CurrencyCode } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface AlertCardProps {
  alerts: {
    budget: BudgetWithStats;
    isOverBudget: boolean;
  }[];
  monthlyAlert?: {
    totalBudget: number;
    totalSpent: number;
    remaining: number;
    thresholdPercentage: number;
    isOverBudget: boolean;
  } | null;
  currency: CurrencyCode;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alerts, monthlyAlert, currency }) => {
  const { t } = useTranslation();

  if (alerts.length === 0 && !monthlyAlert) {
    return null;
  }

  return (
    <div className="space-y-3 mb-5">
      {/* Monthly Threshold Alert if triggered */}
      {monthlyAlert && (
        <div
          className={`p-4 rounded-2xl border-2 shadow-lg transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
            monthlyAlert.isOverBudget
              ? 'bg-red-500/10 border-red-500 text-red-950 dark:text-red-100 dark:bg-red-950/40'
              : 'bg-amber-500/10 border-amber-500 text-amber-950 dark:text-amber-100 dark:bg-amber-950/40'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl text-white ${
                monthlyAlert.isOverBudget ? 'bg-[#EF4444]' : 'bg-[#F59E0B]'
              }`}
            >
              {monthlyAlert.isOverBudget ? <AlertCircle size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div className="flex-1">
              <span className="text-xs uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-white/70 dark:bg-black/40 inline-block mb-1">
                {t('settings.monthlyThreshold')}
              </span>
              <h3 className="text-base font-extrabold tracking-tight">
                {monthlyAlert.isOverBudget
                  ? t('dashboard.alertExceededTitle')
                  : t('dashboard.alertThresholdTitle')}
              </h3>
              <p className="text-xs mt-1 text-slate-700 dark:text-slate-300 font-medium">
                {monthlyAlert.isOverBudget
                  ? t('dashboard.alertExceededMessage')
                  : t('dashboard.alertThresholdMessage')}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-white/80 dark:bg-black/30 p-3 rounded-xl border border-black/5">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    {t('dashboard.initialBudget')}
                  </span>
                  <span className="font-bold">{formatCurrency(monthlyAlert.totalBudget, currency)}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    {t('dashboard.totalSpent')}
                  </span>
                  <span className="font-bold">{formatCurrency(monthlyAlert.totalSpent, currency)}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    {t('dashboard.remainingBudget')}
                  </span>
                  <span
                    className={`font-black ${
                      monthlyAlert.isOverBudget
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {formatCurrency(monthlyAlert.remaining, currency)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    {t('dashboard.configuredThreshold')}
                  </span>
                  <span className="font-bold">{monthlyAlert.thresholdPercentage} %</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Per-Budget Alerts */}
      {alerts.map(({ budget, isOverBudget }) => (
        <div
          key={budget.id}
          className={`p-4 rounded-2xl border-2 shadow-lg transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
            isOverBudget
              ? 'bg-red-500/10 border-[#EF4444] text-red-950 dark:text-red-100 dark:bg-red-950/40'
              : 'bg-amber-500/10 border-[#F59E0B] text-amber-950 dark:text-amber-100 dark:bg-amber-950/40'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl text-white ${
                isOverBudget ? 'bg-[#EF4444]' : 'bg-[#F59E0B]'
              }`}
            >
              {isOverBudget ? <AlertCircle size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-white/70 dark:bg-black/40 inline-block mb-1 truncate max-w-[200px]">
                  {budget.name}
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {Math.round(budget.consumed_percentage)} % {t('dashboard.consumed')}
                </span>
              </div>
              <h3 className="text-base font-extrabold tracking-tight">
                {isOverBudget ? t('dashboard.alertExceededTitle') : t('dashboard.alertThresholdTitle')}
              </h3>
              <p className="text-xs mt-1 text-slate-700 dark:text-slate-300 font-medium">
                {isOverBudget
                  ? t('dashboard.alertExceededMessage')
                  : t('dashboard.alertThresholdMessage')}
              </p>

              {/* Stats Grid inside the Alert Card */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-white/80 dark:bg-black/30 p-3 rounded-xl border border-black/5">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    {t('dashboard.initialBudget')}
                  </span>
                  <span className="font-bold">{formatCurrency(budget.amount, currency)}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    {t('dashboard.totalSpent')}
                  </span>
                  <span className="font-bold">{formatCurrency(budget.total_expenses, currency)}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    {t('dashboard.remainingBudget')}
                  </span>
                  <span
                    className={`font-black ${
                      isOverBudget
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {formatCurrency(budget.remaining_amount, currency)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    {t('dashboard.configuredThreshold')}
                  </span>
                  <span className="font-bold">{budget.threshold_percentage} %</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
