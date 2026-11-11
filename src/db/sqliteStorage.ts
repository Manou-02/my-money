import { Budget, Category, Settings, Transaction } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/theme';

const STORAGE_KEY_SETTINGS = 'kaly_sqlite_settings';
const STORAGE_KEY_BUDGETS = 'kaly_sqlite_budgets';
const STORAGE_KEY_CATEGORIES = 'kaly_sqlite_categories';
const STORAGE_KEY_TRANSACTIONS = 'kaly_sqlite_transactions';

class SqliteStorageManager {
  private initialized = false;

  public init() {
    if (this.initialized) return;

    // Check if settings table exists
    const settingsRaw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!settingsRaw) {
      const defaultSettings: Settings = {
        id: 'settings_1',
        currency: 'Ar',
        language: 'fr',
        theme: 'system',
        monthly_threshold_enabled: true,
        monthly_threshold_percentage: 20,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(defaultSettings));
    }

    // Check if categories table exists
    const categoriesRaw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (!categoriesRaw) {
      const initialCategories: Category[] = DEFAULT_CATEGORIES.map((cat, index) => ({
        id: `cat_${index + 1}`,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        is_default: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(initialCategories));
    }

    // Check if budgets table exists
    const budgetsRaw = localStorage.getItem(STORAGE_KEY_BUDGETS);
    if (!budgetsRaw) {
      // Create initial sample budget: "Budget de novembre" with 1 000 000 Ar
      const initialBudget: Budget = {
        id: 'budget_sample_nov',
        name: 'Budget de novembre',
        amount: 1000000,
        start_date: '2026-11-01',
        end_date: '2026-11-30',
        threshold_enabled: true,
        threshold_percentage: 20,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify([initialBudget]));

      // Create initial transactions
      const sampleCategories = JSON.parse(localStorage.getItem(STORAGE_KEY_CATEGORIES) || '[]');
      const foodCat = sampleCategories.find((c: Category) => c.name === 'Alimentation') || sampleCategories[0];
      const transCat = sampleCategories.find((c: Category) => c.name === 'Transport') || sampleCategories[1];
      const billCat = sampleCategories.find((c: Category) => c.name === 'Factures') || sampleCategories[2];

      const initialTransactions: Transaction[] = [
        {
          id: 'trans_1',
          budget_id: initialBudget.id,
          category_id: foodCat ? foodCat.id : 'cat_1',
          title: 'Courses hebdomadaires',
          description: 'Marché et épicerie locale',
          amount: 250000,
          transaction_date: '2026-11-03',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'trans_2',
          budget_id: initialBudget.id,
          category_id: transCat ? transCat.id : 'cat_2',
          title: 'Carburant moto',
          description: 'Plein pour la semaine',
          amount: 100000,
          transaction_date: '2026-11-05',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'trans_3',
          budget_id: initialBudget.id,
          category_id: billCat ? billCat.id : 'cat_3',
          title: 'Abonnement Internet & Électricité',
          description: 'Facture mensuelle Jirama/Fibre',
          amount: 470000,
          transaction_date: '2026-11-08',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(initialTransactions));
    }

    this.initialized = true;
  }

  // --- SETTINGS ---
  public getSettings(): Settings {
    this.init();
    const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!data) {
      return {
        id: 'settings_1',
        currency: 'Ar',
        language: 'fr',
        theme: 'system',
        monthly_threshold_enabled: true,
        monthly_threshold_percentage: 20,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    return JSON.parse(data);
  }

  public updateSettings(partial: Partial<Settings>): Settings {
    const current = this.getSettings();
    const updated: Settings = {
      ...current,
      ...partial,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    return updated;
  }

  // --- BUDGETS ---
  public getBudgets(): Budget[] {
    this.init();
    const data = localStorage.getItem(STORAGE_KEY_BUDGETS);
    return data ? JSON.parse(data) : [];
  }

  public createBudget(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Budget {
    const budgets = this.getBudgets();
    const newBudget: Budget = {
      ...budget,
      id: `budget_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    budgets.unshift(newBudget);
    localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));
    return newBudget;
  }

  public updateBudget(id: string, updates: Partial<Omit<Budget, 'id' | 'created_at'>>): Budget | null {
    const budgets = this.getBudgets();
    const index = budgets.findIndex((b) => b.id === id);
    if (index === -1) return null;

    budgets[index] = {
      ...budgets[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));
    return budgets[index];
  }

  public deleteBudget(id: string): boolean {
    const budgets = this.getBudgets();
    const filtered = budgets.filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(filtered));

    // Cascade delete transactions associated with this budget (ON DELETE CASCADE)
    const transactions = this.getTransactions();
    const filteredTrans = transactions.filter((t) => t.budget_id !== id);
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(filteredTrans));

    return true;
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    this.init();
    const data = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    return data ? JSON.parse(data) : [];
  }

  public createCategory(cat: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Category {
    const categories = this.getCategories();
    const newCat: Category = {
      ...cat,
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    categories.push(newCat);
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'created_at'>>): Category | null {
    const categories = this.getCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return null;

    categories[index] = {
      ...categories[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    return categories[index];
  }

  public deleteOrDeactivateCategory(id: string): { action: 'deleted' | 'deactivated'; category: Category | null } {
    const categories = this.getCategories();
    const category = categories.find((c) => c.id === id);
    if (!category) return { action: 'deleted', category: null };

    const transactions = this.getTransactions();
    const hasTransactions = transactions.some((t) => t.category_id === id);

    // If default or has transactions, deactivate instead of delete to maintain referential integrity
    if (category.is_default || hasTransactions) {
      category.is_active = false;
      category.updated_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
      return { action: 'deactivated', category };
    }

    const filtered = categories.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(filtered));
    return { action: 'deleted', category };
  }

  // --- TRANSACTIONS ---
  public getTransactions(): Transaction[] {
    this.init();
    const data = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  }

  public createTransaction(trans: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Transaction {
    const transactions = this.getTransactions();
    const newTrans: Transaction = {
      ...trans,
      id: `trans_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    transactions.unshift(newTrans);
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
    return newTrans;
  }

  public updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id' | 'created_at'>>): Transaction | null {
    const transactions = this.getTransactions();
    const index = transactions.findIndex((t) => t.id === id);
    if (index === -1) return null;

    transactions[index] = {
      ...transactions[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
    return transactions[index];
  }

  public deleteTransaction(id: string): boolean {
    const transactions = this.getTransactions();
    const filtered = transactions.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(filtered));
    return true;
  }
}

export const sqliteStorage = new SqliteStorageManager();
