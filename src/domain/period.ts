import type { Period } from "../types";

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const getPeriodWindow = (
  now: Date,
  period: Period,
  startOfWeek = 0
): { start: Date; end: Date } => {
  if (period === "daily") {
    const start = startOfDay(now);
    const end = addDays(start, 1);
    return { start, end };
  }

  if (period === "weekly") {
    const today = startOfDay(now);
    const day = today.getDay();
    const diff = (day - startOfWeek + 7) % 7;
    const start = addDays(today, -diff);
    const end = addDays(start, 7);
    return { start, end };
  }

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
};

export const formatCountdownToReset = (
  now: Date,
  period: Period,
  startOfWeek = 0
): string => {
  const { end } = getPeriodWindow(now, period, startOfWeek);
  const diffMs = Math.max(0, end.getTime() - now.getTime());
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(" ");
};
