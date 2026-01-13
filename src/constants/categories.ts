import type { Category } from "../types";

export const CATEGORY_LABELS: Record<Category, string> = {
  food: "Food",
  transport: "Transport",
  shopping: "Shopping",
  fun: "Fun",
  other: "Other"
};

export const CATEGORY_COLORS: Record<Category, string> = {
  food: "#7C3AED",
  transport: "#2563EB",
  shopping: "#F97316",
  fun: "#10B981",
  other: "#64748B"
};

export const CATEGORY_OPTIONS: Category[] = [
  "food",
  "transport",
  "shopping",
  "fun",
  "other"
];
