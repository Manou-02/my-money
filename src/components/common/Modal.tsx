import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`w-full ${maxWidth} bg-white dark:bg-[#181C22] rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-[#2E3642] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200`}
      >
        {/* Handle for drag indicator on mobile */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden" />
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[#2E3642]">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate pr-2">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#222730] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
