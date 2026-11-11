import React, { useState } from 'react';
import { Calendar, Edit, FileText, Trash2, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Budget, Category, CurrencyCode, Transaction } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { Modal } from '../common/Modal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { CategoryIcon } from '../common/CategoryIcon';

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  budget?: Budget;
  category?: Category;
  currency: CurrencyCode;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  isOpen,
  onClose,
  transaction,
  budget,
  category,
  currency,
  onEdit,
  onDelete,
}) => {
  const { t, i18n } = useTranslation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!transaction) return null;

  const handleDelete = () => {
    onDelete(transaction.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const catColor = category?.color || '#3B82F6';

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={t('expenses.expenseDetails')}>
        <div className="space-y-4">
          {/* Header Amount & Icon */}
          <div className="text-center py-4 bg-slate-50 dark:bg-[#222730]/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div
              className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-2 shadow-xs"
              style={{ backgroundColor: `${catColor}20`, color: catColor }}
            >
              <CategoryIcon name={category?.icon || 'Receipt'} size={28} color={catColor} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-0.5">
              {transaction.title}
            </h3>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
              -{formatCurrency(transaction.amount, currency)}
            </span>
          </div>

          {/* Details Table */}
          <div className="space-y-2.5 text-xs bg-white dark:bg-[#181C22] p-4 rounded-2xl border border-slate-200 dark:border-[#2E3642]">
            {/* Category */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-[#222730]">
              <span className="text-slate-500 dark:text-slate-400">{t('expenses.categoryField')}</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: catColor }} />
                <span>{category?.name || 'Catégorie'}</span>
              </div>
            </div>

            {/* Associated Budget */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-[#222730]">
              <span className="text-slate-500 dark:text-slate-400">{t('expenses.budgetField')}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Wallet size={13} className="text-blue-500" />
                {budget?.name || 'Budget'}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-[#222730]">
              <span className="text-slate-500 dark:text-slate-400">{t('expenses.dateField')}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Calendar size={13} />
                {formatDate(transaction.transaction_date, i18n.language)}
              </span>
            </div>

            {/* Description */}
            {transaction.description && (
              <div className="pt-1.5">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">
                  {t('expenses.descriptionField')}
                </span>
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#222730]/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                  {transaction.description}
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <Trash2 size={15} />
              {t('common.delete')}
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(transaction);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100"
            >
              <Edit size={15} />
              {t('common.edit')}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title={t('expenses.deleteConfirmTitle')}
        message={t('expenses.deleteConfirmMessage')}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};
