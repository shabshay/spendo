import { v4 as uuid } from "uuid";
import type { BudgetSettings, Expense } from "../types";

export interface IExpenseService {
  getSettings(): Promise<BudgetSettings | null>;
  saveSettings(settings: BudgetSettings): Promise<void>;
  listExpenses(): Promise<Expense[]>;
  addExpense(expense: Omit<Expense, "id" | "createdAt">): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;
  clearAll(): Promise<void>;
}

const SETTINGS_KEY = "spendo_settings";
const EXPENSES_KEY = "spendo_expenses";

export class LocalStorageExpenseService implements IExpenseService {
  async getSettings(): Promise<BudgetSettings | null> {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? (JSON.parse(stored) as BudgetSettings) : null;
  }

  async saveSettings(settings: BudgetSettings): Promise<void> {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  async listExpenses(): Promise<Expense[]> {
    const stored = localStorage.getItem(EXPENSES_KEY);
    return stored ? (JSON.parse(stored) as Expense[]) : [];
  }

  async addExpense(expense: Omit<Expense, "id" | "createdAt">): Promise<Expense> {
    const list = await this.listExpenses();
    const next: Expense = {
      ...expense,
      id: uuid(),
      createdAt: new Date().toISOString()
    };
    list.unshift(next);
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(list));
    return next;
  }

  async deleteExpense(id: string): Promise<void> {
    const list = await this.listExpenses();
    const filtered = list.filter((expense) => expense.id !== id);
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(filtered));
  }

  async clearAll(): Promise<void> {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(EXPENSES_KEY);
  }
}
