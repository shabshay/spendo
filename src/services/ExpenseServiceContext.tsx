import React, { createContext, useContext, useMemo, useState } from "react";
import type { BudgetSettings, Expense } from "../types";
import { LocalStorageExpenseService, type IExpenseService } from "./expenseService";

interface ExpenseContextValue {
  settings: BudgetSettings | null;
  expenses: Expense[];
  isLoading: boolean;
  saveSettings: (settings: BudgetSettings) => Promise<void>;
  addExpense: (expense: Omit<Expense, "id" | "createdAt">) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
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

  const refresh = async () => {
    setIsLoading(true);
    const [storedSettings, storedExpenses] = await Promise.all([
      service.getSettings(),
      service.listExpenses()
    ]);
    setSettings(storedSettings);
    setExpenses(storedExpenses);
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

  const deleteExpense = async (id: string) => {
    await service.deleteExpense(id);
    setExpenses((prev) => prev.filter((item) => item.id !== id));
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
    saveSettings,
    addExpense,
    deleteExpense,
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
