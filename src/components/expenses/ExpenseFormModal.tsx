import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Budget, Category, CurrencyCode, Transaction } from '../../types';
import { Modal } from '../common/Modal';
import { getTodayDateString } from '../../utils/dates';
import { CategoryIcon } from '../common/CategoryIcon';

const expenseSchema = z.object({
  title: z.string().min(1, 'validation.required'),
  amount: z.coerce.number().positive('validation.positiveNumber'),
  category_id: z.string().min(1, 'validation.required'),
  budget_id: z.string().min(1, 'validation.required'),
  transaction_date: z.string().min(1, 'validation.required'),
  description: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => void;
  initialData?: Transaction | null;
  budgets: Budget[];
  categories: Category[];
  currency: CurrencyCode;
  defaultBudgetId?: string | null;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  budgets,
  categories,
  currency,
  defaultBudgetId,
}) => {
  const { t } = useTranslation();

  const activeCategories = categories.filter((c) => c.is_active || (initialData && c.id === initialData.category_id));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      title: '',
      amount: undefined as any,
      category_id: activeCategories.length > 0 ? activeCategories[0].id : '',
      budget_id: defaultBudgetId || (budgets.length > 0 ? budgets[0].id : ''),
      transaction_date: getTodayDateString(),
      description: '',
    },
  });

  const selectedCategoryId = watch('category_id');

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          title: initialData.title,
          amount: initialData.amount,
          category_id: initialData.category_id,
          budget_id: initialData.budget_id,
          transaction_date: initialData.transaction_date,
          description: initialData.description || '',
        });
      } else {
        reset({
          title: '',
          amount: undefined as any,
          category_id: activeCategories.length > 0 ? activeCategories[0].id : '',
          budget_id: defaultBudgetId || (budgets.length > 0 ? budgets[0].id : ''),
          transaction_date: getTodayDateString(),
          description: '',
        });
      }
    }
  }, [isOpen, initialData, defaultBudgetId, budgets, reset]);

  const onFormSubmit = (data: ExpenseFormData) => {
    onSubmit({
      title: data.title.trim(),
      amount: Math.round(data.amount),
      category_id: data.category_id,
      budget_id: data.budget_id,
      transaction_date: data.transaction_date,
      description: data.description ? data.description.trim() : null,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? t('expenses.editExpense') : t('expenses.addExpense')}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('expenses.titleField')} *
          </label>
          <input
            type="text"
            placeholder={t('expenses.titlePlaceholder')}
            {...register('title')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#2E3642] bg-white dark:bg-[#181C22] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="text-xs text-red-500 mt-1">{t(errors.title.message as string)}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('expenses.amountField')} ({currency}) *
          </label>
          <input
            type="number"
            step="1"
            placeholder={t('expenses.amountPlaceholder')}
            {...register('amount')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#2E3642] bg-white dark:bg-[#181C22] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.amount && (
            <p className="text-xs text-red-500 mt-1">{t(errors.amount.message as string)}</p>
          )}
        </div>

        {/* Category Picker Chips */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            {t('expenses.categoryField')} *
          </label>
          <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-100 dark:border-[#2E3642] rounded-2xl">
            {activeCategories.map((c) => {
              const isSelected = selectedCategoryId === c.id;
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setValue('category_id', c.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all ${
                    isSelected
                      ? 'border-2 shadow-xs'
                      : 'border border-transparent hover:bg-slate-50 dark:hover:bg-[#222730]'
                  }`}
                  style={{
                    borderColor: isSelected ? c.color : 'transparent',
                    backgroundColor: isSelected ? `${c.color}15` : undefined,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mb-1"
                    style={{ backgroundColor: `${c.color}25`, color: c.color }}
                  >
                    <CategoryIcon name={c.icon} size={16} color={c.color} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate w-full">
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.category_id && (
            <p className="text-xs text-red-500 mt-1">{t(errors.category_id.message as string)}</p>
          )}
        </div>

        {/* Associated Budget & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Associated Budget */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('expenses.budgetField')} *
            </label>
            <select
              {...register('budget_id')}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#2E3642] bg-white dark:bg-[#181C22] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {budgets.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            {errors.budget_id && (
              <p className="text-xs text-red-500 mt-1">{t(errors.budget_id.message as string)}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('expenses.dateField')} *
            </label>
            <input
              type="date"
              {...register('transaction_date')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#2E3642] bg-white dark:bg-[#181C22] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.transaction_date && (
              <p className="text-xs text-red-500 mt-1">
                {t(errors.transaction_date.message as string)}
              </p>
            )}
          </div>
        </div>

        {/* Optional Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('expenses.descriptionField')}
          </label>
          <textarea
            rows={2}
            placeholder={t('expenses.descriptionPlaceholder')}
            {...register('description')}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#2E3642] bg-white dark:bg-[#181C22] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Actions */}
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
