import React, { useState } from 'react';
import {
  Bell,
  Check,
  Coins,
  Database,
  FileCode,
  Globe,
  Moon,
  Smartphone,
  Sun,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CurrencyCode, Settings, ThemeMode } from '../../types';
import { ExpoProjectExportModal } from './ExpoProjectExportModal';

interface SettingsScreenProps {
  settings: Settings;
  budgetsCount: number;
  expensesCount: number;
  categoriesCount: number;
  onUpdateSettings: (partial: Partial<Settings>) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  budgetsCount,
  expensesCount,
  categoriesCount,
  onUpdateSettings,
}) => {
  const { t } = useTranslation();
  const [showExportModal, setShowExportModal] = useState(false);

  const currencies: { code: CurrencyCode; label: string }[] = [
    { code: 'Ar', label: 'Ariary malgache (Ar)' },
    { code: 'EUR', label: 'Euro (€)' },
    { code: 'USD', label: 'Dollar US ($)' },
    { code: 'FCFA', label: 'Franc CFA (FCFA)' },
    { code: 'GBP', label: 'Livre Sterling (£)' },
  ];

  const themes: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'light', label: t('settings.themeLight'), icon: <Sun size={16} /> },
    { mode: 'dark', label: t('settings.themeDark'), icon: <Moon size={16} /> },
    { mode: 'system', label: t('settings.themeSystem'), icon: <Smartphone size={16} /> },
  ];

  return (
    <div className="space-y-5 pb-24">
      {/* 1. GENERAL SECTION */}
      <div className="rounded-3xl p-5 bg-white dark:bg-[#181C22] border border-slate-200/80 dark:border-[#2E3642] shadow-xs space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {t('settings.general')}
        </h3>

        {/* Language selector */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#222730]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Globe size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                {t('settings.language')}
              </span>
              <span className="text-[11px] text-slate-500">Français / English</span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#222730] p-1 rounded-xl">
            <button
              onClick={() => onUpdateSettings({ language: 'fr' })}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                settings.language === 'fr'
                  ? 'bg-white dark:bg-[#181C22] text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => onUpdateSettings({ language: 'en' })}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                settings.language === 'en'
                  ? 'bg-white dark:bg-[#181C22] text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Currency selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Coins size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                {t('settings.currency')}
              </span>
              <span className="text-[11px] text-slate-500">Ariary (Ar) par défaut</span>
            </div>
          </div>

          <select
            value={settings.currency}
            onChange={(e) => onUpdateSettings({ currency: e.target.value as CurrencyCode })}
            className="px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-[#222730] border-none text-slate-800 dark:text-slate-200 font-bold focus:outline-none"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. THRESHOLDS SECTION */}
      <div className="rounded-3xl p-5 bg-white dark:bg-[#181C22] border border-slate-200/80 dark:border-[#2E3642] shadow-xs space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {t('settings.thresholds')}
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <Bell size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {t('settings.monthlyThreshold')}
                </span>
                <span className="text-[11px] text-slate-500">
                  {settings.monthly_threshold_enabled ? `${settings.monthly_threshold_percentage} %` : 'Désactivé'}
                </span>
              </div>
            </div>

            <label htmlFor="toggle-monthly-threshold" className="relative inline-flex items-center cursor-pointer">
              <input
                id="toggle-monthly-threshold"
                type="checkbox"
                checked={settings.monthly_threshold_enabled}
                onChange={(e) => onUpdateSettings({ monthly_threshold_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {t('settings.monthlyThresholdDesc')}
          </p>

          {settings.monthly_threshold_enabled && (
            <div className="p-3 bg-slate-50 dark:bg-[#222730]/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-400">{t('settings.monthlyThresholdPercentage')}</span>
                <span className="text-amber-600 dark:text-amber-400">{settings.monthly_threshold_percentage} %</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={settings.monthly_threshold_percentage}
                onChange={(e) =>
                  onUpdateSettings({ monthly_threshold_percentage: parseInt(e.target.value, 10) })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. APPEARANCE (Light, Dark, System) */}
      <div className="rounded-3xl p-5 bg-white dark:bg-[#181C22] border border-slate-200/80 dark:border-[#2E3642] shadow-xs space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {t('settings.appearance')}
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {themes.map((th) => {
            const isSelected = settings.theme === th.mode;
            return (
              <button
                key={th.mode}
                onClick={() => onUpdateSettings({ theme: th.mode })}
                className={`py-3 px-2 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/70 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 dark:border-[#2E3642] hover:bg-slate-50 dark:hover:bg-[#222730] text-slate-700 dark:text-slate-300'
                }`}
              >
                {th.icon}
                <span className="text-xs font-bold">{th.label}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. OFFLINE STORAGE & STATS */}
      <div className="rounded-3xl p-5 bg-white dark:bg-[#181C22] border border-slate-200/80 dark:border-[#2E3642] shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Database size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {t('settings.offlineStorage')}
            </h4>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Check size={12} /> Drizzle ORM + SQLite
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('settings.offlineStorageDesc')}
        </p>

        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#222730]/60">
            <span className="text-base font-black text-slate-900 dark:text-slate-100">{budgetsCount}</span>
            <span className="text-[10px] text-slate-500 block">{t('settings.budgetsCount')}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#222730]/60">
            <span className="text-base font-black text-slate-900 dark:text-slate-100">{expensesCount}</span>
            <span className="text-[10px] text-slate-500 block">{t('settings.expensesCount')}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#222730]/60">
            <span className="text-base font-black text-slate-900 dark:text-slate-100">{categoriesCount}</span>
            <span className="text-[10px] text-slate-500 block">{t('settings.categoriesCount')}</span>
          </div>
        </div>
      </div>

      {/* 5. EXPO REACT NATIVE PROJECT EXPORT BUTTON */}
      <div className="rounded-3xl p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md space-y-3">
        <div className="flex items-center gap-2">
          <FileCode size={20} />
          <h4 className="font-extrabold text-sm">{t('settings.exportSection')}</h4>
        </div>
        <p className="text-xs text-blue-100 leading-relaxed">
          Accédez au projet source complet React Native Expo (Expo Router + SQLite + Drizzle ORM) et téléchargez le fichier .zip prêt à l'emploi.
        </p>
        <button
          onClick={() => setShowExportModal(true)}
          className="w-full py-2.5 px-4 rounded-xl bg-white text-blue-700 font-extrabold text-xs hover:bg-blue-50 active:scale-98 transition-all shadow-sm"
        >
          {t('settings.exportBtn')}
        </button>
      </div>

      <ExpoProjectExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
    </div>
  );
};
