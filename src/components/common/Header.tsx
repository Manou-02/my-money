import React from 'react';
import { Plus, Smartphone, Maximize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TabType } from '../../types';

interface HeaderProps {
  currentTab: TabType;
  onAddExpense: () => void;
  isFrameMode: boolean;
  onToggleFrameMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onAddExpense,
  isFrameMode,
  onToggleFrameMode,
}) => {
  const { t } = useTranslation();

  const getTitle = () => {
    switch (currentTab) {
      case 'home':
        return t('dashboard.title');
      case 'expenses':
        return t('expenses.title');
      case 'settings':
        return t('settings.title');
      default:
        return 'KalyBudget';
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-[#181C22]/90 backdrop-blur-md px-4 py-3 border-b border-slate-100 dark:border-[#2E3642] flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-xs">
          KB
        </div>
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
            {getTitle()}
          </h1>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
            ● SQLite Offline
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleFrameMode}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#222730] transition-colors"
          title={isFrameMode ? 'Passer en plein écran' : 'Afficher le cadre smartphone'}
        >
          {isFrameMode ? <Maximize2 size={16} /> : <Smartphone size={16} />}
        </button>

        <button
          onClick={onAddExpense}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2563EB] dark:bg-[#3B82F6] text-white text-xs font-bold shadow-sm shadow-blue-500/20 active:scale-95 transition-transform"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">{t('expenses.addExpense')}</span>
        </button>
      </div>
    </header>
  );
};
