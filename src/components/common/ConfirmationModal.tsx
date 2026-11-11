import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  isDanger = true,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#181C22] border border-slate-200 dark:border-[#2E3642] p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2.5 rounded-full ${isDanger ? 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'}`}>
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-medium rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#222730] transition-colors"
          >
            {cancelLabel || t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2.5 text-sm font-semibold rounded-xl text-white shadow-sm transition-transform active:scale-95 ${
              isDanger
                ? 'bg-[#EF4444] hover:bg-red-600'
                : 'bg-[#2563EB] hover:bg-blue-600'
            }`}
          >
            {confirmLabel || t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};
