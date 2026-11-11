import React from 'react';
import { Home, Receipt, Settings, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TabType } from '../../types';

interface BottomTabsProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  hasActiveAlert: boolean;
}

export const BottomTabs: React.FC<BottomTabsProps> = ({
  currentTab,
  onSelectTab,
  hasActiveAlert,
}) => {
  const { t } = useTranslation();

  const tabs: { id: TabType; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'home', label: t('nav.home'), icon: Home },
    { id: 'expenses', label: t('nav.expenses'), icon: Receipt },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <nav className="sticky bottom-0 z-30 bg-white/95 dark:bg-[#181C22]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-[#2E3642] px-6 py-2 pb-safe">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl relative transition-all active:scale-95 ${
                isActive
                  ? 'text-[#2563EB] dark:text-[#3B82F6]'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              <div className="relative">
                <Icon size={22} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
                {tab.id === 'home' && hasActiveAlert && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                )}
                {tab.id === 'home' && hasActiveAlert && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500" />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-bold ${isActive ? 'font-extrabold' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-4 h-0.5 rounded-full bg-[#2563EB] dark:bg-[#3B82F6] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
