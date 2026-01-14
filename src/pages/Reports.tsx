import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Link } from "react-router-dom";
import { CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_OPTIONS } from "../constants/categories";
import { getPeriodWindow } from "../domain/period";
import { useExpenseService } from "../services/ExpenseServiceContext";
import type { Category } from "../types";
import { formatILS } from "../utils/money";
import { useCountUp } from "../utils/useCountUp";
import { useMotionPreference } from "../utils/animation";
import MotionButton from "../components/MotionButton";
import "../styles/reports.css";

const RANGE_OPTIONS = [
  { key: "today", label: "Today" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "custom", label: "Custom" }
] as const;

type RangeKey = (typeof RANGE_OPTIONS)[number]["key"];

const formatInputDate = (date: Date) => date.toLocaleDateString("en-CA");

const parseInputDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const getRangeWindow = (
  now: Date,
  range: RangeKey,
  startOfWeek = 0,
  custom?: { start: string; end: string }
) => {
  if (range === "today") return getPeriodWindow(now, "daily", startOfWeek);
  if (range === "week") return getPeriodWindow(now, "weekly", startOfWeek);
  if (range === "month") return getPeriodWindow(now, "monthly", startOfWeek);
  const startDate = custom ? parseInputDate(custom.start) : now;
  const endDate = custom ? parseInputDate(custom.end) : now;
  const start = startDate <= endDate ? startDate : endDate;
  const end = startDate <= endDate ? endDate : startDate;
  const exclusiveEnd = new Date(end);
  exclusiveEnd.setDate(exclusiveEnd.getDate() + 1);
  return { start, end: exclusiveEnd };
};

const buildDateBuckets = (start: Date, end: Date) => {
  const buckets: Date[] = [];
  const cursor = new Date(start);
  while (cursor < end) {
    buckets.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return buckets;
};

const Reports = () => {
  const { expenses, settings } = useExpenseService();
  const [range, setRange] = useState<RangeKey>("month");
  const today = new Date();
  const [customStart, setCustomStart] = useState(() => {
    const date = new Date(today);
    date.setDate(date.getDate() - 6);
    return formatInputDate(date);
  });
  const [customEnd, setCustomEnd] = useState(() => formatInputDate(today));
  const { shouldReduceMotion } = useMotionPreference();

  if (!settings) return null;

  const { start, end } = getRangeWindow(today, range, settings.startOfWeek, {
    start: customStart,
    end: customEnd
  });

  const rangeExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const created = new Date(expense.createdAt).getTime();
      return created >= start.getTime() && created < end.getTime();
    });
  }, [expenses, start, end]);

  const totalSpentAgorot = rangeExpenses.reduce(
    (sum, expense) => sum + expense.amountAgorot,
    0
  );
  const daysInRange = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / 86400000)
  );
  const averagePerDayAgorot = totalSpentAgorot / daysInRange;

  const dailyTotals = buildDateBuckets(start, end).map((date) => {
    const label = date.toLocaleDateString("en-IL", {
      month: "short",
      day: "numeric"
    });
    const dayStart = new Date(date);
    const dayEnd = new Date(date);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const total = rangeExpenses
      .filter((expense) => {
        const created = new Date(expense.createdAt).getTime();
        return created >= dayStart.getTime() && created < dayEnd.getTime();
      })
      .reduce((sum, expense) => sum + expense.amountAgorot, 0);
    return { label, totalAgorot: total, total: total / 100 };
  });

  const highestDayAgorot = dailyTotals.reduce(
    (max, entry) => Math.max(max, entry.totalAgorot),
    0
  );

  const categoryTotals = CATEGORY_OPTIONS.map((category) => {
    const total = rangeExpenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amountAgorot, 0);
    return { category, total };
  }).filter((entry) => entry.total > 0);

  const topCategory = categoryTotals.reduce<{ category: Category | null; total: number }>(
    (current, entry) => (entry.total > current.total ? entry : current),
    { category: null, total: 0 }
  );

  const donutData = categoryTotals.map((entry) => ({
    name: CATEGORY_LABELS[entry.category],
    value: entry.total / 100,
    category: entry.category
  }));

  const totalSpentDisplay = useCountUp(totalSpentAgorot);
  const averageDisplay = useCountUp(Math.round(averagePerDayAgorot));
  const highestDisplay = useCountUp(highestDayAgorot);

  return (
    <div className="app-shell reports">
      <header className="page-header">
        <Link to="/" className="ghost-button">
          Back
        </Link>
        <h2>Reports</h2>
      </header>

      <div className="segmented reports__range">
        {RANGE_OPTIONS.map((option) => (
          <MotionButton
            key={option.key}
            className={range === option.key ? "active" : ""}
            onClick={() => setRange(option.key)}
          >
            {option.label}
          </MotionButton>
        ))}
      </div>

      {range === "custom" && (
        <div className="card reports__custom">
          <label className="reports__label" htmlFor="reports-start">
            Start date
          </label>
          <input
            id="reports-start"
            className="input-field"
            type="date"
            value={customStart}
            onChange={(event) => setCustomStart(event.target.value)}
          />
          <label className="reports__label" htmlFor="reports-end">
            End date
          </label>
          <input
            id="reports-end"
            className="input-field"
            type="date"
            value={customEnd}
            onChange={(event) => setCustomEnd(event.target.value)}
          />
        </div>
      )}

      <div className="reports__kpis">
        <div className="card reports__kpi">
          <span>Total spent</span>
          <strong>{formatILS(Math.round(totalSpentDisplay))}</strong>
        </div>
        <div className="card reports__kpi">
          <span>Average per day</span>
          <strong>{formatILS(Math.round(averageDisplay))}</strong>
        </div>
        <div className="card reports__kpi">
          <span>Highest day</span>
          <strong>{formatILS(Math.round(highestDisplay))}</strong>
        </div>
        <div className="card reports__kpi">
          <span>Top category</span>
          <strong>
            {topCategory.category ? CATEGORY_LABELS[topCategory.category] : "—"}
          </strong>
        </div>
      </div>

      <div className="card reports__chart">
        <div className="section-title">Spending over time</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dailyTotals}>
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(value: number) => `₪${value}`} />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#0f172a"
              strokeWidth={3}
              isAnimationActive={!shouldReduceMotion}
              animationDuration={320}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card reports__chart">
        <div className="section-title">Category breakdown</div>
        {donutData.length === 0 ? (
          <div className="reports__empty">No data for this range yet.</div>
        ) : (
          <div className="reports__donut">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  isAnimationActive={!shouldReduceMotion}
                  animationDuration={320}
                >
                  {donutData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.category]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₪${value}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="reports__legend">
              {donutData.map((entry) => (
                <div key={entry.name} className="reports__legend-item">
                  <span
                    className="reports__legend-dot"
                    style={{ background: CATEGORY_COLORS[entry.category] }}
                  />
                  <span>{entry.name}</span>
                  <span className="reports__legend-value">₪{entry.value.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
