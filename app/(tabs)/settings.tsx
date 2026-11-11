import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import {
  Globe,
  Coins,
  Bell,
  Sun,
  Moon,
  Smartphone,
  Database,
  Check,
  FileCode,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useBudgetStore } from '../../src/stores/budgetStore';
import { useCategoryStore } from '../../src/stores/categoryStore';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { themeColors } from '../../src/constants/theme';
import { CurrencyCode, ThemeMode } from '../../src/types';
import { ExpoProjectExportModal } from '../../src/components/settings/ExpoProjectExportModal';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { settings, updateSettings, setLanguage, setTheme, setCurrency } = useSettingsStore();
  const { budgets } = useBudgetStore();
  const { categories } = useCategoryStore();
  const { transactions } = useTransactionStore();

  const [showExportModal, setShowExportModal] = useState(false);

  const isDark = settings.theme === 'dark';
  const colors = isDark ? themeColors.dark : themeColors.light;

  const currencies: { code: CurrencyCode; label: string }[] = [
    { code: 'Ar', label: 'Ariary (Ar)' },
    { code: 'EUR', label: 'Euro (€)' },
    { code: 'USD', label: 'Dollar ($)' },
    { code: 'FCFA', label: 'Franc CFA' },
  ];

  const themes: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'light', label: 'Clair', icon: <Sun size={18} color={colors.primary} /> },
    { mode: 'dark', label: 'Sombre', icon: <Moon size={18} color={colors.primary} /> },
    { mode: 'system', label: 'Système', icon: <Smartphone size={18} color={colors.primary} /> },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {t('settings.title', 'Paramètres')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. GENERAL */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            {t('settings.general', 'Général')}
          </Text>

          {/* Language */}
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.primaryContainer }]}>
                <Globe size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                  {t('settings.language', 'Langue')}
                </Text>
                <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                  Français / English
                </Text>
              </View>
            </View>

            <View style={[styles.langSwitch, { backgroundColor: colors.surfaceVariant }]}>
              <TouchableOpacity
                onPress={() => setLanguage('fr')}
                style={[
                  styles.langBtn,
                  settings.language === 'fr' && [styles.langBtnActive, { backgroundColor: colors.surface }],
                ]}
              >
                <Text
                  style={[
                    styles.langBtnText,
                    { color: settings.language === 'fr' ? colors.primary : colors.textSecondary },
                  ]}
                >
                  FR
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setLanguage('en')}
                style={[
                  styles.langBtn,
                  settings.language === 'en' && [styles.langBtnActive, { backgroundColor: colors.surface }],
                ]}
              >
                <Text
                  style={[
                    styles.langBtnText,
                    { color: settings.language === 'en' ? colors.primary : colors.textSecondary },
                  ]}
                >
                  EN
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Currency */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.surfaceVariant }]}>
                <Coins size={18} color={colors.warning} />
              </View>
              <View>
                <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                  {t('settings.currency', 'Devise')}
                </Text>
                <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                  Ariary par défaut
                </Text>
              </View>
            </View>

            <View style={styles.currenciesRow}>
              {currencies.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  onPress={() => setCurrency(c.code)}
                  style={[
                    styles.currencyPill,
                    {
                      backgroundColor: settings.currency === c.code ? colors.primary : colors.surfaceVariant,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.currencyPillText,
                      { color: settings.currency === c.code ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {c.code}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 2. THRESHOLDS */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            {t('settings.thresholds', 'Seuils d\'alerte')}
          </Text>

          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.surfaceVariant }]}>
                <Bell size={18} color={colors.warning} />
              </View>
              <View>
                <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                  {t('settings.monthlyThreshold', 'Seuil mensuel')}
                </Text>
                <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                  {settings.monthly_threshold_enabled ? `${settings.monthly_threshold_percentage} %` : 'Désactivé'}
                </Text>
              </View>
            </View>

            <Switch
              value={settings.monthly_threshold_enabled}
              onValueChange={(val) => updateSettings({ monthly_threshold_enabled: val })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {settings.monthly_threshold_enabled && (
            <View style={[styles.thresholdSliderBox, { backgroundColor: colors.surfaceVariant }]}>
              <View style={styles.sliderHeader}>
                <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>
                  Pourcentage d'alerte
                </Text>
                <Text style={[styles.sliderVal, { color: colors.warning }]}>
                  {settings.monthly_threshold_percentage} %
                </Text>
              </View>
              <View style={styles.thresholdSteps}>
                {[10, 20, 30, 40, 50].map((pct) => (
                  <TouchableOpacity
                    key={pct}
                    onPress={() => updateSettings({ monthly_threshold_percentage: pct })}
                    style={[
                      styles.stepBtn,
                      settings.monthly_threshold_percentage === pct && [
                        styles.stepBtnActive,
                        { backgroundColor: colors.primary },
                      ],
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepBtnText,
                        {
                          color:
                            settings.monthly_threshold_percentage === pct ? '#FFFFFF' : colors.textSecondary,
                        },
                      ]}
                    >
                      {pct}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* 3. APPEARANCE */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            {t('settings.appearance', 'Apparence')}
          </Text>

          <View style={styles.themesRow}>
            {themes.map((th) => {
              const isSelected = settings.theme === th.mode;
              return (
                <TouchableOpacity
                  key={th.mode}
                  onPress={() => setTheme(th.mode)}
                  style={[
                    styles.themeCard,
                    {
                      backgroundColor: isSelected ? colors.primaryContainer : colors.surfaceVariant,
                      borderColor: isSelected ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  {th.icon}
                  <Text
                    style={[
                      styles.themeLabel,
                      { color: isSelected ? colors.primary : colors.textPrimary },
                    ]}
                  >
                    {th.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 4. OFFLINE STORAGE & STATS */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <Database size={18} color={colors.success} />
            </View>
            <View>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                {t('settings.offlineStorage', 'Stockage local SQLite')}
              </Text>
              <Text style={[styles.rowSub, { color: colors.success }]}>
                ● Expo SQLite & Drizzle ORM
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statCell, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[styles.statNum, { color: colors.textPrimary }]}>{budgets.length}</Text>
              <Text style={[styles.statDesc, { color: colors.textSecondary }]}>Prévisions</Text>
            </View>
            <View style={[styles.statCell, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[styles.statNum, { color: colors.textPrimary }]}>{transactions.length}</Text>
              <Text style={[styles.statDesc, { color: colors.textSecondary }]}>Dépenses</Text>
            </View>
            <View style={[styles.statCell, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[styles.statNum, { color: colors.textPrimary }]}>{categories.length}</Text>
              <Text style={[styles.statDesc, { color: colors.textSecondary }]}>Catégories</Text>
            </View>
          </View>
        </View>

        {/* 5. EXPO PROJECT EXPORT */}
        <TouchableOpacity
          onPress={() => setShowExportModal(true)}
          style={[styles.exportCard, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <View style={styles.exportHeader}>
            <FileCode size={20} color="#FFFFFF" />
            <Text style={styles.exportTitle}>Code React Native Expo SDK 57</Text>
          </View>
          <Text style={styles.exportDesc}>
            Téléchargez l'archive complète du projet prêt à être exécuté avec Expo Go.
          </Text>
          <View style={styles.exportBtn}>
            <Text style={styles.exportBtnText}>Exporter le projet (.zip)</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <ExpoProjectExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  section: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  rowSub: {
    fontSize: 10,
  },
  langSwitch: {
    flexDirection: 'row',
    padding: 2,
    borderRadius: 8,
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  langBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  currenciesRow: {
    flexDirection: 'row',
    gap: 4,
  },
  currencyPill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  currencyPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  thresholdSliderBox: {
    padding: 10,
    borderRadius: 12,
    gap: 8,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  sliderVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  thresholdSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stepBtnActive: {},
  stepBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  themesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
  },
  themeLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statCell: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 15,
    fontWeight: '900',
  },
  statDesc: {
    fontSize: 10,
  },
  exportCard: {
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  exportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exportTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  exportDesc: {
    color: '#E0E7FF',
    fontSize: 11,
    lineHeight: 16,
  },
  exportBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  exportBtnText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '800',
  },
});
