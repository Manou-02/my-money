import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Category } from '../../types';
import { Modal } from '../common/Modal';
import { AVAILABLE_COLORS, AVAILABLE_ICONS } from '../../constants/theme';
import { CategoryIcon } from '../common/CategoryIcon';

const categorySchema = z.object({
  name: z.string().min(1, 'validation.required'),
  icon: z.string().min(1, 'validation.required'),
  color: z.string().min(1, 'validation.required'),
  is_active: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => void;
  initialData?: Category | null;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: '',
      icon: 'ShoppingCart',
      color: '#3B82F6',
      is_active: true,
    },
  });

  const selectedIcon = watch('icon');
  const selectedColor = watch('color');

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          icon: initialData.icon,
          color: initialData.color,
          is_active: initialData.is_active,
        });
      } else {
        reset({
          name: '',
          icon: 'ShoppingCart',
          color: '#3B82F6',
          is_active: true,
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const onFormSubmit = (data: CategoryFormData) => {
    onSubmit({
      name: data.name.trim(),
      icon: data.icon,
      color: data.color,
      is_default: initialData ? initialData.is_default : false,
      is_active: data.is_active,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? t('categories.edit') : t('categories.add')}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('categories.name')} *
          </label>
          <input
            type="text"
            placeholder={t('categories.namePlaceholder')}
            {...register('name')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#2E3642] bg-white dark:bg-[#181C22] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{t(errors.name.message as string)}</p>
          )}
        </div>

        {/* Color Palette Picker */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            {t('categories.color')} *
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setValue('color', c)}
                className={`w-7 h-7 rounded-full transition-transform active:scale-95 ${
                  selectedColor === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Icon Picker */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            {t('categories.icon')} *
          </label>
          <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-100 dark:border-[#2E3642] rounded-2xl">
            {AVAILABLE_ICONS.map((iconName) => {
              const isSelected = selectedIcon === iconName;
              return (
                <button
                  type="button"
                  key={iconName}
                  onClick={() => setValue('icon', iconName)}
                  className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-500'
                      : 'hover:bg-slate-100 dark:hover:bg-[#222730] text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <CategoryIcon name={iconName} size={20} color={isSelected ? selectedColor : undefined} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#222730]/50 border border-slate-100 dark:border-slate-800">
          <label htmlFor="is_active_cat" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
            {t('categories.status')} ({watch('is_active') ? t('categories.active') : t('categories.inactive')})
          </label>
          <input
            id="is_active_cat"
            type="checkbox"
            {...register('is_active')}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
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
