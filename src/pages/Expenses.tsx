import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from "../constants/categories";
import { getPeriodWindow } from "../domain/period";
import { useExpenseService } from "../services/ExpenseServiceContext";
import type { Category, Expense } from "../types";
import { formatILS } from "../utils/money";
import "../styles/expenses.css";

const RANGE_OPTIONS = [
  { key: "today", label: "Today" },
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" }
] as const;

type RangeKey = (typeof RANGE_OPTIONS)[number]["key"];

const getRangeWindow = (now: Date, range: RangeKey, startOfWeek = 0) => {
  if (range === "today" || range === "day") {
    return getPeriodWindow(now, "daily", startOfWeek);
  }
  if (range === "week") {
    return getPeriodWindow(now, "weekly", startOfWeek);
  }
  return getPeriodWindow(now, "monthly", startOfWeek);
};

const groupByCategory = (items: Expense[]) => {
  return CATEGORY_OPTIONS.map((category) => {
    const group = items.filter((expense) => expense.category === category);
    const total = group.reduce((sum, expense) => sum + expense.amountAgorot, 0);
    return { category, group, total };
  }).filter((group) => group.group.length > 0);
};

const Expenses = () => {
  const { expenses, settings } = useExpenseService();
  const [range, setRange] = useState<RangeKey>("today");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<Category>>(new Set());

  if (!settings) return null;

  const { start, end } = getRangeWindow(new Date(), range, settings.startOfWeek);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return expenses.filter((expense) => {
      const created = new Date(expense.createdAt).getTime();
      const inRange = created >= start.getTime() && created < end.getTime();
      if (!inRange) return false;
      if (!query) return true;
      return (
        CATEGORY_LABELS[expense.category].toLowerCase().includes(query) ||
        expense.note?.toLowerCase().includes(query)
      );
    });
  }, [expenses, start, end, search]);

  const grouped = groupByCategory(filtered);

  const toggleExpand = (category: Category) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <div className="app-shell expenses">
      <header className="page-header">
        <Link to="/" className="ghost-button">
          Back
        </Link>
        <h2>All expenses</h2>
      </header>

      <div className="segmented">
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option.key}
            className={range === option.key ? "active" : ""}
            onClick={() => setRange(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <input
        className="input-field expenses__search"
        placeholder="Search expenses..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="expenses__groups">
        {grouped.length === 0 ? (
          <div className="card expenses__empty">No expenses found.</div>
        ) : (
          grouped.map((group) => (
            <div key={group.category} className="card expenses__group">
              <button
                className="expenses__group-header"
                onClick={() => toggleExpand(group.category)}
              >
                <div>
                  <div className="expenses__group-title">
                    {CATEGORY_LABELS[group.category]}
                  </div>
                  <div className="expenses__group-count">
                    {group.group.length} items
                  </div>
                </div>
                <div className="expenses__group-total">
                  {formatILS(group.total)}
                </div>
              </button>
              {expanded.has(group.category) && (
                <div className="expenses__items">
                  {group.group.map((expense) => (
                    <div key={expense.id} className="expenses__item">
                      <div>
                        <div className="expenses__item-note">
                          {expense.note || "No note"}
                        </div>
                        <div className="expenses__item-date">
                          {new Date(expense.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="expenses__item-amount">
                        {formatILS(expense.amountAgorot)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Expenses;
