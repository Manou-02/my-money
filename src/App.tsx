/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Home, Receipt, Settings as SettingsIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from './stores/settingsStore';
import { themeColors } from './constants/theme';
import { TabType } from './types';

// Expo Router Screens
import DashboardScreen from '../app/(tabs)/index';
import ExpensesScreen from '../app/(tabs)/expenses';
import SettingsScreen from '../app/(tabs)/settings';

export default function App() {
  const { t } = useTranslation();
  const { settings } = useSettingsStore();
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  const isDark = settings.theme === 'dark';
  const colors = isDark ? themeColors.dark : themeColors.light;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Active Screen */}
      <View style={styles.screenContainer}>
        {currentTab === 'home' && <DashboardScreen />}
        {currentTab === 'expenses' && <ExpensesScreen />}
        {currentTab === 'settings' && <SettingsScreen />}
      </View>

      {/* Bottom Tabs Navigation */}
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => setCurrentTab('home')}
          style={styles.tabItem}
          activeOpacity={0.7}
        >
          <Home
            size={22}
            color={currentTab === 'home' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color: currentTab === 'home' ? colors.primary : colors.textSecondary,
                fontWeight: currentTab === 'home' ? '800' : '600',
              },
            ]}
          >
            {t('nav.home', 'Accueil')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setCurrentTab('expenses')}
          style={styles.tabItem}
          activeOpacity={0.7}
        >
          <Receipt
            size={22}
            color={currentTab === 'expenses' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color: currentTab === 'expenses' ? colors.primary : colors.textSecondary,
                fontWeight: currentTab === 'expenses' ? '800' : '600',
              },
            ]}
          >
            {t('nav.expenses', 'Dépenses')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setCurrentTab('settings')}
          style={styles.tabItem}
          activeOpacity={0.7}
        >
          <SettingsIcon
            size={22}
            color={currentTab === 'settings' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color: currentTab === 'settings' ? colors.primary : colors.textSecondary,
                fontWeight: currentTab === 'settings' ? '800' : '600',
              },
            ]}
          >
            {t('nav.settings', 'Paramètres')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    paddingBottom: 6,
    paddingTop: 6,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
  },
});
