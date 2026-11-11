import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Receipt, Settings as SettingsIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { themeColors } from '../../src/constants/theme';

export default function TabLayout() {
  const { t } = useTranslation();
  const { settings } = useSettingsStore();

  const isDark = settings.theme === 'dark';
  const colors = isDark ? themeColors.dark : themeColors.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.home', 'Accueil'),
          tabBarIcon: ({ color, size }) => <Home size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: t('nav.expenses', 'Dépenses'),
          tabBarIcon: ({ color, size }) => <Receipt size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('nav.settings', 'Paramètres'),
          tabBarIcon: ({ color, size }) => <SettingsIcon size={size || 22} color={color} />,
        }}
      />
    </Tabs>
  );
}
