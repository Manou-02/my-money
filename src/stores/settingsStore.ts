import { create } from 'zustand';
import { CurrencyCode, Settings, ThemeMode } from '../types';
import { sqliteStorage } from '../db/sqliteStorage';
import i18n from '../i18n';

interface SettingsState {
  settings: Settings;
  isLoading: boolean;
  loadSettings: () => void;
  updateSettings: (partial: Partial<Settings>) => void;
  setLanguage: (lang: 'fr' | 'en') => void;
  setTheme: (theme: ThemeMode) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setMonthlyThreshold: (enabled: boolean, percentage: number) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: sqliteStorage.getSettings(),
  isLoading: false,

  loadSettings: () => {
    const s = sqliteStorage.getSettings();
    set({ settings: s });
    if (s.language && i18n.language !== s.language) {
      i18n.changeLanguage(s.language);
    }
  },

  updateSettings: (partial) => {
    const updated = sqliteStorage.updateSettings(partial);
    set({ settings: updated });
    if (partial.language) {
      i18n.changeLanguage(partial.language);
      localStorage.setItem('kaly_language', partial.language);
    }
  },

  setLanguage: (lang) => {
    get().updateSettings({ language: lang });
  },

  setTheme: (theme) => {
    get().updateSettings({ theme });
  },

  setCurrency: (currency) => {
    get().updateSettings({ currency });
  },

  setMonthlyThreshold: (enabled, percentage) => {
    get().updateSettings({
      monthly_threshold_enabled: enabled,
      monthly_threshold_percentage: percentage,
    });
  },
}));
