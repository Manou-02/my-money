import { create } from 'zustand';
import { Category } from '../types';
import { sqliteStorage } from '../db/sqliteStorage';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  loadCategories: () => void;
  createCategory: (cat: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => Category;
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id' | 'created_at'>>) => void;
  deleteOrDeactivateCategory: (id: string) => { action: 'deleted' | 'deactivated'; category: Category | null };
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: sqliteStorage.getCategories(),
  isLoading: false,

  loadCategories: () => {
    const categories = sqliteStorage.getCategories();
    set({ categories });
  },

  createCategory: (cat) => {
    const created = sqliteStorage.createCategory(cat);
    get().loadCategories();
    return created;
  },

  updateCategory: (id, updates) => {
    sqliteStorage.updateCategory(id, updates);
    get().loadCategories();
  },

  deleteOrDeactivateCategory: (id) => {
    const result = sqliteStorage.deleteOrDeactivateCategory(id);
    get().loadCategories();
    return result;
  },
}));
