import { v4 as uuid } from "uuid";
import type { BudgetSettings, Expense } from "../types";

export interface IExpenseService {
  load(): Promise<{ settings: BudgetSettings | null; expenses: Expense[]; warning?: string }>;
  saveSettings(settings: BudgetSettings): Promise<void>;
  listExpenses(): Promise<Expense[]>;
  addExpense(expense: Omit<Expense, "id" | "createdAt">): Promise<Expense>;
  updateExpense(
    id: string,
    updates: Omit<Expense, "id" | "createdAt">
  ): Promise<Expense | null>;
  deleteExpense(id: string): Promise<Expense | null>;
  restoreExpense(expense: Expense): Promise<void>;
  clearAll(): Promise<void>;
}

const SETTINGS_KEY = "spendo_settings";
const EXPENSES_KEY = "spendo_expenses";
const STORAGE_KEY = "spendo_storage";
const STORAGE_VERSION = 1;
const RESET_WARNING = "We reset your local data after a storage issue.";

interface StorageState {
  version: number;
  settings: BudgetSettings | null;
  expenses: Expense[];
}

const emptyState = (): StorageState => ({
  version: STORAGE_VERSION,
  settings: null,
  expenses: []
});

const safeParse = <T,>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const isBudgetSettings = (value: unknown): value is BudgetSettings => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as BudgetSettings;
  return (
    typeof candidate.amountAgorot === "number" &&
    ["daily", "weekly", "monthly"].includes(candidate.period)
  );
};

const isExpense = (value: unknown): value is Expense => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Expense;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.amountAgorot === "number" &&
    typeof candidate.category === "string"
  );
};

const normalizeExpenses = (value: unknown): Expense[] => {
  if (!Array.isArray(value)) return [];
  return value.filter(isExpense);
};

const normalizeState = (value: unknown): StorageState | null => {
  if (!value || typeof value !== "object") return null;
  const candidate = value as StorageState;
  if (typeof candidate.version !== "number") return null;
  return {
    version: STORAGE_VERSION,
    settings: isBudgetSettings(candidate.settings) ? candidate.settings : null,
    expenses: normalizeExpenses(candidate.expenses)
  };
};

const sortExpenses = (expenses: Expense[]) =>
  [...expenses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

const writeState = (state: StorageState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const clearLegacy = () => {
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(EXPENSES_KEY);
};

const readState = (): { state: StorageState; warning?: string } => {
  const rawStored = localStorage.getItem(STORAGE_KEY);
  const stored = safeParse<StorageState>(rawStored);
  if (rawStored) {
    const normalized = stored ? normalizeState(stored) : null;
    if (normalized) {
      return { state: normalized };
    }
    clearLegacy();
    const reset = emptyState();
    writeState(reset);
    return { state: reset, warning: RESET_WARNING };
  }

  const legacySettingsRaw = localStorage.getItem(SETTINGS_KEY);
  const legacyExpensesRaw = localStorage.getItem(EXPENSES_KEY);
  const hasLegacy = Boolean(legacySettingsRaw || legacyExpensesRaw);
  if (hasLegacy) {
    const legacySettings = safeParse<BudgetSettings>(legacySettingsRaw);
    const legacyExpenses = safeParse<Expense[]>(legacyExpensesRaw);
    const legacyWarning =
      (legacySettingsRaw && !legacySettings) || (legacyExpensesRaw && !legacyExpenses)
        ? RESET_WARNING
        : undefined;
    const migrated: StorageState = {
      version: STORAGE_VERSION,
      settings: isBudgetSettings(legacySettings) ? legacySettings : null,
      expenses: normalizeExpenses(legacyExpenses)
    };
    writeState(migrated);
    clearLegacy();
    return { state: migrated, warning: legacyWarning };
  }

  return { state: emptyState() };
};

export class LocalStorageExpenseService implements IExpenseService {
  async load(): Promise<{ settings: BudgetSettings | null; expenses: Expense[]; warning?: string }> {
    const { state, warning } = readState();
    return { settings: state.settings, expenses: state.expenses, warning };
  }

  async saveSettings(settings: BudgetSettings): Promise<void> {
    const { state } = readState();
    const next: StorageState = { ...state, settings };
    writeState(next);
  }

  async listExpenses(): Promise<Expense[]> {
    const { state } = readState();
    return state.expenses;
  }

  async addExpense(expense: Omit<Expense, "id" | "createdAt">): Promise<Expense> {
    const { state } = readState();
    const next: Expense = {
      ...expense,
      id: uuid(),
      createdAt: new Date().toISOString()
    };
    const updated: StorageState = {
      ...state,
      expenses: [next, ...state.expenses]
    };
    writeState(updated);
    return next;
  }

  async updateExpense(
    id: string,
    updates: Omit<Expense, "id" | "createdAt">
  ): Promise<Expense | null> {
    const { state } = readState();
    let updatedExpense: Expense | null = null;
    const updatedList = state.expenses.map((expense) => {
      if (expense.id !== id) return expense;
      updatedExpense = { ...expense, ...updates };
      return updatedExpense;
    });

    if (!updatedExpense) return null;

    writeState({ ...state, expenses: sortExpenses(updatedList) });
    return updatedExpense;
  }

  async deleteExpense(id: string): Promise<Expense | null> {
    const { state } = readState();
    const target = state.expenses.find((expense) => expense.id === id) ?? null;
    const filtered = state.expenses.filter((expense) => expense.id !== id);
    writeState({ ...state, expenses: filtered });
    return target;
  }

  async restoreExpense(expense: Expense): Promise<void> {
    const { state } = readState();
    const exists = state.expenses.some((item) => item.id === expense.id);
    const nextList = exists ? state.expenses : sortExpenses([expense, ...state.expenses]);
    writeState({ ...state, expenses: nextList });
  }

  async clearAll(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
    clearLegacy();
  }
}
