import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Category, CurrencyCode, TimePeriodFilter, Transaction } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { isDateInPeriod } from '../../utils/dates';
import { CategoryIcon } from '../common/CategoryIcon';

interface ExpenseChartsProps {
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyCode;
}

export const ExpenseCharts: React.FC<ExpenseChartsProps> = ({
  transactions,
  categories,
  currency,
}) => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<TimePeriodFilter>('month');
  const [activeChart, setActiveChart] = useState<'donut' | 'bars'>('donut');

  // Filter transactions by period
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => isDateInPeriod(t.transaction_date, period));
  }, [transactions, period]);

  // Aggregate by Category
  const categoryData = useMemo(() => {
    const map = new Map<string, { category: Category; total: number }>();
    const totalSpent = filteredTransactions.reduce((acc, curr) => acc + curr.amount, 0);

    filteredTransactions.forEach((tx) => {
      const cat = categories.find((c) => c.id === tx.category_id) || {
        id: 'other',
        name: 'Autres',
        icon: 'MoreHorizontal',
        color: '#64748B',
        is_default: true,
        is_active: true,
        created_at: '',
        updated_at: '',
      };
      const current = map.get(cat.id) || { category: cat, total: 0 };
      current.total += tx.amount;
      map.set(cat.id, current);
    });

    const items = Array.from(map.values())
      .map((item) => ({
        ...item,
        percentage: totalSpent > 0 ? (item.total / totalSpent) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return { items, totalSpent };
  }, [filteredTransactions, categories]);

  // Time timeline data (for bars: last 7 days or weeks or months)
  const timelineData = useMemo(() => {
    // Group transactions by date
    const dateMap = new Map<string, number>();

    // Generate recent dates based on period
    const now = new Date();
    const dates: string[] = [];

    if (period === 'day') {
      // 24 hours / today
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      dates.push(todayStr);
    } else if (period === 'week') {
      // last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        dates.push(dStr);
      }
    } else {
      // Current month weekly intervals (Week 1, Week 2, Week 3, Week 4)
      for (let i = 3; i >= 0; i--) {
        dates.push(`S${4 - i}`);
      }
    }

    // Default 0
    dates.forEach((d) => dateMap.set(d, 0));

    if (period === 'month') {
      // Put expenses in week buckets
      filteredTransactions.forEach((tx) => {
        const d = parseInt(tx.transaction_date.split('-')[2] || '1', 10);
        let bucket = 'S1';
        if (d > 7 && d <= 14) bucket = 'S2';
        else if (d > 14 && d <= 21) bucket = 'S3';
        else if (d > 21) bucket = 'S4';
        dateMap.set(bucket, (dateMap.get(bucket) || 0) + tx.amount);
      });
    } else {
      filteredTransactions.forEach((tx) => {
        if (dateMap.has(tx.transaction_date)) {
          dateMap.set(tx.transaction_date, (dateMap.get(tx.transaction_date) || 0) + tx.amount);
        }
      });
    }

    const maxVal = Math.max(...Array.from(dateMap.values()), 1);

    return Array.from(dateMap.entries()).map(([label, value]) => ({
      label: period === 'week' ? label.split('-').slice(1).join('/') : label,
      value,
      heightRatio: (value / maxVal) * 100,
    }));
  }, [filteredTransactions, period]);

  // Donut SVG parameters
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;

  return (
    <div className="rounded-3xl p-5 bg-white dark:bg-[#181C22] border border-slate-200/80 dark:border-[#2E3642] shadow-sm mb-5">
      {/* Header and Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#222730] mb-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
            {t('dashboard.chartsTitle')}
          </h3>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {formatCurrency(categoryData.totalSpent, currency)}
          </span>
        </div>

        {/* Period Selector: Jour / Semaine / Mois */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#222730] p-1 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setPeriod('day')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              period === 'day'
                ? 'bg-white dark:bg-[#181C22] text-[#2563EB] dark:text-[#3B82F6] shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('dashboard.periodDay')}
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              period === 'week'
                ? 'bg-white dark:bg-[#181C22] text-[#2563EB] dark:text-[#3B82F6] shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('dashboard.periodWeek')}
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              period === 'month'
                ? 'bg-white dark:bg-[#181C22] text-[#2563EB] dark:text-[#3B82F6] shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('dashboard.periodMonth')}
          </button>
        </div>
      </div>

      {/* Chart Type Toggle */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <button
          onClick={() => setActiveChart('donut')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
            activeChart === 'donut'
              ? 'bg-blue-50 border-blue-200 text-[#2563EB] dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          {t('dashboard.byCategory')}
        </button>
        <button
          onClick={() => setActiveChart('bars')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
            activeChart === 'bars'
              ? 'bg-blue-50 border-blue-200 text-[#2563EB] dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          {t('dashboard.evolution')}
        </button>
      </div>

      {/* Render Chart Content */}
      {categoryData.items.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
          {t('common.noData')} pour cette période
        </div>
      ) : activeChart === 'donut' ? (
        <div className="flex flex-col items-center">
          {/* Donut SVG */}
          <div className="relative w-[180px] h-[180px] my-2">
            <svg width={size} height={size} className="rotate-[-90deg]">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-slate-100 dark:text-[#222730]"
              />
              {categoryData.items.map((item) => {
                const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -cumulativeOffset;
                cumulativeOffset += (item.percentage / 100) * circumference;

                return (
                  <circle
                    key={item.category.id}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={item.category.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                {t('dashboard.totalSpent')}
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                {formatCurrency(categoryData.totalSpent, currency)}
              </span>
            </div>
          </div>

          {/* Category Breakdown Legend */}
          <div className="w-full mt-4 space-y-2">
            {categoryData.items.map((item) => (
              <div
                key={item.category.id}
                className="flex items-center justify-between text-xs p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#222730]/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.category.color }}
                  />
                  <CategoryIcon name={item.category.icon} size={14} color={item.category.color} />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                    {item.category.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(item.total, currency)}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 w-9 text-right">
                    {Math.round(item.percentage)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Evolution Bar Chart */
        <div className="py-2">
          <div className="h-40 flex items-end justify-between gap-3 px-2 pt-4">
            {timelineData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[40px]">
                  {item.value > 0 ? (item.value >= 1000 ? `${Math.round(item.value / 1000)}k` : item.value) : ''}
                </span>
                <div className="w-full bg-slate-100 dark:bg-[#222730] rounded-t-lg h-full max-h-[100px] flex items-end">
                  <div
                    className="w-full bg-[#2563EB] dark:bg-[#3B82F6] rounded-t-lg transition-all duration-500"
                    style={{ height: `${Math.max(item.heightRatio, item.value > 0 ? 8 : 2)}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
