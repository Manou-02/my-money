import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useBudgetStore } from '../src/stores/budgetStore';
import { useCategoryStore } from '../src/stores/categoryStore';
import { useTransactionStore } from '../src/stores/transactionStore';
import '../src/i18n';

export default function RootLayout() {
  const { settings, loadSettings } = useSettingsStore();
  const { loadBudgets } = useBudgetStore();
  const { loadCategories } = useCategoryStore();
  const { loadTransactions } = useTransactionStore();

  useEffect(() => {
    loadSettings();
    loadBudgets();
    loadCategories();
    loadTransactions();
  }, []);

  const isDark = settings.theme === 'dark';

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
