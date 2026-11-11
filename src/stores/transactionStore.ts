import { create } from 'zustand';
import { TimePeriodFilter, Transaction } from '../types';
import { sqliteStorage } from '../db/sqliteStorage';

interface TransactionState {
  transactions: Transaction[];
  selectedCategoryId: string; // 'all' or category_id
  selectedPeriod: TimePeriodFilter;
  selectedBudgetId: string; // 'all' or budget_id
  isLoading: boolean;
  loadTransactions: () => void;
  createTransaction: (trans: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'created_at'>>) => void;
  deleteTransaction: (id: string) => void;
  setSelectedCategory: (catId: string) => void;
  setSelectedPeriod: (period: TimePeriodFilter) => void;
  setSelectedBudget: (budgetId: string) => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: sqliteStorage.getTransactions(),
  selectedCategoryId: 'all',
  selectedPeriod: 'all',
  selectedBudgetId: 'all',
  isLoading: false,

  loadTransactions: () => {
    const transactions = sqliteStorage.getTransactions();
    set({ transactions });
  },

  createTransaction: (data) => {
    const created = sqliteStorage.createTransaction(data);
    get().loadTransactions();
    return created;
  },

  updateTransaction: (id, updates) => {
    sqliteStorage.updateTransaction(id, updates);
    get().loadTransactions();
  },

  deleteTransaction: (id) => {
    sqliteStorage.deleteTransaction(id);
    get().loadTransactions();
  },

  setSelectedCategory: (selectedCategoryId) => {
    set({ selectedCategoryId });
  },

  setSelectedPeriod: (selectedPeriod) => {
    set({ selectedPeriod });
  },

  setSelectedBudget: (selectedBudgetId) => {
    set({ selectedBudgetId });
  },
}));
