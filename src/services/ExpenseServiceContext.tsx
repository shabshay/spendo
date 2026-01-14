import React, { createContext, useContext, useMemo, useState } from "react";
import type { BudgetSettings, Expense } from "../types";
import { LocalStorageExpenseService, type IExpenseService } from "./expenseService";

interface ExpenseContextValue {
  settings: BudgetSettings | null;
  expenses: Expense[];
  isLoading: boolean;
  storageWarning: string | null;
  saveSettings: (settings: BudgetSettings) => Promise<void>;
  addExpense: (expense: Omit<Expense, "id" | "createdAt">) => Promise<void>;
  updateExpense: (
    id: string,
    updates: Omit<Expense, "id" | "createdAt">
  ) => Promise<Expense | null>;
  deleteExpense: (id: string) => Promise<Expense | null>;
  restoreExpense: (expense: Expense) => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

const ExpenseServiceContext = createContext<ExpenseContextValue | undefined>(
  undefined
);

export const ExpenseServiceProvider: React.FC<React.PropsWithChildren> = ({
  children
}) => {
  const service = useMemo(() => new LocalStorageExpenseService(), []);
  const [settings, setSettings] = useState<BudgetSettings | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);

  const refresh = async () => {
    setIsLoading(true);
    const { settings: storedSettings, expenses: storedExpenses, warning } =
      await service.load();
    setSettings(storedSettings);
    setExpenses(storedExpenses);
    setStorageWarning(warning ?? null);
    setIsLoading(false);
  };

  React.useEffect(() => {
    void refresh();
  }, []);

  const saveSettings = async (next: BudgetSettings) => {
    await service.saveSettings(next);
    setSettings(next);
  };

  const addExpense = async (expense: Omit<Expense, "id" | "createdAt">) => {
    const created = await service.addExpense(expense);
    setExpenses((prev) => [created, ...prev]);
  };

  const updateExpense = async (
    id: string,
    updates: Omit<Expense, "id" | "createdAt">
  ) => {
    const updated = await service.updateExpense(id, updates);
    if (updated) {
      setExpenses((prev) =>
        prev.map((expense) => (expense.id === id ? updated : expense))
      );
    }
    return updated;
  };

  const deleteExpense = async (id: string) => {
    const deleted = await service.deleteExpense(id);
    if (deleted) {
      setExpenses((prev) => prev.filter((item) => item.id !== id));
    }
    return deleted;
  };

  const restoreExpense = async (expense: Expense) => {
    await service.restoreExpense(expense);
    setExpenses((prev) => {
      const exists = prev.some((item) => item.id === expense.id);
      if (exists) return prev;
      return [expense, ...prev].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  };

  const clearAll = async () => {
    await service.clearAll();
    setSettings(null);
    setExpenses([]);
  };

  const value: ExpenseContextValue = {
    settings,
    expenses,
    isLoading,
    storageWarning,
    saveSettings,
    addExpense,
    updateExpense,
    deleteExpense,
    restoreExpense,
    clearAll,
    refresh
  };

  return (
    <ExpenseServiceContext.Provider value={value}>
      {children}
    </ExpenseServiceContext.Provider>
  );
};

export const useExpenseService = (): ExpenseContextValue => {
  const context = useContext(ExpenseServiceContext);
  if (!context) {
    throw new Error("useExpenseService must be used within ExpenseServiceProvider");
  }
  return context;
};

export type { IExpenseService };
