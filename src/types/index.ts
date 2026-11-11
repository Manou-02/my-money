export type ThemeMode = 'light' | 'dark' | 'system';

export type CurrencyCode = 'Ar' | 'EUR' | 'USD' | 'FCFA' | 'GBP';

export interface Settings {
  id: string;
  currency: CurrencyCode;
  language: 'fr' | 'en';
  theme: ThemeMode;
  monthly_threshold_enabled: boolean;
  monthly_threshold_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number; // Stored as integer currency units
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  threshold_enabled: boolean;
  threshold_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetWithStats extends Budget {
  total_expenses: number;
  remaining_amount: number;
  consumed_percentage: number;
  threshold_amount: number;
  is_threshold_reached: boolean;
  is_over_budget: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  budget_id: string;
  category_id: string;
  title: string;
  description?: string | null;
  amount: number;
  transaction_date: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

export interface TransactionWithDetails extends Transaction {
  category?: Category;
  budget?: Budget;
}

export type TimePeriodFilter = 'all' | 'day' | 'week' | 'month';

export type TabType = 'home' | 'expenses' | 'settings';
