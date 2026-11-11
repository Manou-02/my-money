import React, { useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Category } from '../../types';
import { Modal } from '../common/Modal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { CategoryIcon } from '../common/CategoryIcon';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onCreateCategory: () => void;
  onEditCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => { action: 'deleted' | 'deactivated'; category: Category | null };
}

export const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({
  isOpen,
  onClose,
  categories,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const { t } = useTranslation();
  const [selectedCatToDelete, setSelectedCatToDelete] = useState<Category | null>(null);

  const handleConfirmDelete = () => {
    if (selectedCatToDelete) {
      onDeleteCategory(selectedCatToDelete.id);
      setSelectedCatToDelete(null);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={t('categories.title')}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('categories.defaultProtectedNotice')}
            </p>
            <button
              onClick={() => {
                onClose();
                onCreateCategory();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2563EB] dark:bg-[#3B82F6] text-white font-bold text-xs shrink-0 active:scale-95 transition-transform"
            >
              <Plus size={14} />
              {t('categories.add')}
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#222730] max-h-[60vh] overflow-y-auto">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between py-2.5 px-1 hover:bg-slate-50 dark:hover:bg-[#222730]/40 rounded-xl"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${c.color}20`, color: c.color }}
                  >
                    <CategoryIcon name={c.icon} size={16} color={c.color} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {c.name}
                      </span>
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
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      onClose();
                      onEditCategory(c);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    title={t('common.edit')}
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={() => setSelectedCatToDelete(c)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    title={t('common.delete')}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={!!selectedCatToDelete}
        title={t('categories.deleteConfirmTitle')}
        message={
          selectedCatToDelete?.is_default
            ? t('categories.deleteConfirmMessage')
            : t('categories.deleteDirectMessage')
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setSelectedCatToDelete(null)}
      />
    </>
  );
};
