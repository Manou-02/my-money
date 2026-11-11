import { create } from 'zustand';
import { Budget } from '../types';
import { sqliteStorage } from '../db/sqliteStorage';

interface BudgetState {
  budgets: Budget[];
  activeBudgetId: string | null;
  isLoading: boolean;
  loadBudgets: () => void;
  createBudget: (budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>) => Budget;
  updateBudget: (id: string, updates: Partial<Omit<Budget, 'id' | 'created_at'>>) => void;
  deleteBudget: (id: string) => void;
  setActiveBudgetId: (id: string | null) => void;
}

export const useBudgetStore = create<BudgetState>((set, get) => {
  const initialBudgets = sqliteStorage.getBudgets();
  return {
    budgets: initialBudgets,
    activeBudgetId: initialBudgets.length > 0 ? initialBudgets[0].id : null,
    isLoading: false,

    loadBudgets: () => {
      const budgets = sqliteStorage.getBudgets();
      const currentActive = get().activeBudgetId;
      const stillExists = budgets.some((b) => b.id === currentActive);
      set({
        budgets,
        activeBudgetId: stillExists ? currentActive : budgets.length > 0 ? budgets[0].id : null,
      });
    },

    createBudget: (budgetData) => {
      const created = sqliteStorage.createBudget(budgetData);
      get().loadBudgets();
      set({ activeBudgetId: created.id });
      return created;
    },

    updateBudget: (id, updates) => {
      sqliteStorage.updateBudget(id, updates);
      get().loadBudgets();
    },

    deleteBudget: (id) => {
      sqliteStorage.deleteBudget(id);
      get().loadBudgets();
    },

    setActiveBudgetId: (id) => {
      set({ activeBudgetId: id });
    },
  };
});
