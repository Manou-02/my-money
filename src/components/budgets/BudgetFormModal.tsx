import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Budget, CurrencyCode } from '../../types';
import { Modal } from '../common/Modal';
import { getMonthRange, getTodayDateString } from '../../utils/dates';

const budgetSchema = z
  .object({
    name: z.string().min(1, 'validation.required'),
    amount: z.coerce.number().positive('validation.positiveNumber'),
    start_date: z.string().min(1, 'validation.required'),
    end_date: z.string().min(1, 'validation.required'),
    threshold_enabled: z.boolean(),
    threshold_percentage: z.coerce.number().min(1, 'validation.percentageRange').max(100, 'validation.percentageRange'),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: 'validation.endDateBeforeStart',
    path: ['end_date'],
  });

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Budget, 'id' | 'created_at' | 'updated_at'>) => void;
  initialData?: Budget | null;
  currency: CurrencyCode;
}

export const BudgetFormModal: React.FC<BudgetFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  currency,
}) => {
  const { t } = useTranslation();

  const now = new Date();
  const currentMonth = getMonthRange(now.getFullYear(), now.getMonth());

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema) as any,
    defaultValues: initialData
      ? {
          name: initialData.name,
          amount: initialData.amount,
          start_date: initialData.start_date,
          end_date: initialData.end_date,
          threshold_enabled: initialData.threshold_enabled,
          threshold_percentage: initialData.threshold_percentage,
        }
      : {
          name: '',
          amount: 1000000,
          start_date: currentMonth.start,
          end_date: currentMonth.end,
          threshold_enabled: true,
          threshold_percentage: 20,
        },
  });

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          amount: initialData.amount,
          start_date: initialData.start_date,
          end_date: initialData.end_date,
          threshold_enabled: initialData.threshold_enabled,
          threshold_percentage: initialData.threshold_percentage,
        });
      } else {
        reset({
          name: '',
          amount: 1000000,
          start_date: getTodayDateString(),
          end_date: currentMonth.end,
          threshold_enabled: true,
          threshold_percentage: 20,
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const thresholdEnabled = watch('threshold_enabled');
  const amountVal = watch('amount') || 0;
  const thresholdPctVal = watch('threshold_percentage') || 20;
  const computedThresholdAmount = Math.round((amountVal * thresholdPctVal) / 100);

  const onFormSubmit = (data: BudgetFormData) => {
    onSubmit({
      name: data.name.trim(),
      amount: Math.round(data.amount),
      start_date: data.start_date,
      end_date: data.end_date,
      threshold_enabled: data.threshold_enabled,
      threshold_percentage: data.threshold_percentage,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? t('budgets.edit') : t('budgets.create')}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('budgets.name')} *
          </label>
          <input
            type="text"
            placeholder={t('budgets.namePlaceholder')}
            {...register('name')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#2E3642] bg-white dark:bg-[#181C22] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{t(errors.name.message as string)}</p>
          )}
        </div>

        {/* Initial Amount */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('budgets.amount')} ({currency}) *
          </label>
          <input
            type="number"
            step="1"
            placeholder={t('budgets.amountPlaceholder')}
            {...register('amount')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#2E3642] bg-white dark:bg-[#181C22] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.amount && (
            <p className="text-xs text-red-500 mt-1">{t(errors.amount.message as string)}</p>
          )}
        </div>

        {/* Dates Grid: Start & End */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('budgets.startDate')} *
            </label>
            <input
              type="date"
              {...register('start_date')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#2E3642] bg-white dark:bg-[#181C22] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.start_date && (
              <p className="text-xs text-red-500 mt-1">{t(errors.start_date.message as string)}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('budgets.endDate')} *
            </label>
            <input
              type="date"
              {...register('end_date')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#2E3642] bg-white dark:bg-[#181C22] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.end_date && (
              <p className="text-xs text-red-500 mt-1">{t(errors.end_date.message as string)}</p>
            )}
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
          {t('budgets.ruleDateNotice')}
        </p>

        {/* Threshold Section */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#222730]/50 border border-slate-200/60 dark:border-[#2E3642] space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="threshold_enabled" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
              {t('budgets.enableThreshold')}
            </label>
            <input
              id="threshold_enabled"
              type="checkbox"
              {...register('threshold_enabled')}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {thresholdEnabled && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {t('budgets.thresholdPercentage')}
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {thresholdPctVal} % (~ {computedThresholdAmount.toLocaleString()} {currency})
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                {...register('threshold_percentage')}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {t('budgets.thresholdHelp')}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#222730]"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2563EB] dark:bg-[#3B82F6] hover:bg-blue-600 shadow-md shadow-blue-500/20 active:scale-95 transition-transform"
          >
            {t('common.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
