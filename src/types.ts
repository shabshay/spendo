export type Period = "daily" | "weekly" | "monthly";

export interface BudgetSettings {
  period: Period;
  amountAgorot: number;
  startOfWeek?: number;
}

export type Category = "food" | "transport" | "shopping" | "fun" | "other";

export interface Expense {
  id: string;
  createdAt: string;
  amountAgorot: number;
  category: Category;
  note?: string;
}
