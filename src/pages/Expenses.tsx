import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from "../constants/categories";
import { getPeriodWindow } from "../domain/period";
import { useExpenseService } from "../services/ExpenseServiceContext";
import type { Category, Expense } from "../types";
import { formatILS } from "../utils/money";
import ExpenseSheet from "../components/ExpenseSheet";
import ToastStack, { type ToastMessage } from "../components/ToastStack";
import MotionButton from "../components/MotionButton";
import { useMotionPreference } from "../utils/animation";
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
  const {
    expenses,
    settings,
    deleteExpense,
    restoreExpense,
    updateExpense
  } = useExpenseService();
  const [range, setRange] = useState<RangeKey>("today");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<Category>>(new Set());
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [returnFocusEl, setReturnFocusEl] = useState<HTMLElement | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { shouldReduceMotion } = useMotionPreference();

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

  const handleDismiss = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleDelete = async (expense: Expense) => {
    const deleted = await deleteExpense(expense.id);
    if (!deleted) return;
    const toastId = `undo-${Date.now()}`;
    setToasts((prev) => [
      ...prev,
      {
        id: toastId,
        type: "info",
        message: "Expense deleted.",
        actionLabel: "Undo",
        durationMs: 5000,
        onAction: () => {
          void restoreExpense(deleted);
          handleDismiss(toastId);
        }
      }
    ]);
  };

  const handleEditSubmit = async (expense: Omit<Expense, "id" | "createdAt">) => {
    if (!editingExpense) return;
    await updateExpense(editingExpense.id, expense);
    setEditingExpense(null);
  };

  const itemOffset = shouldReduceMotion ? 0 : 8;
  const expandMotion = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scaleY: 0.98 },
        animate: { opacity: 1, scaleY: 1 },
        exit: { opacity: 0, scaleY: 0.98 }
      };

  return (
    <div className="app-shell expenses">
      <ToastStack toasts={toasts} onDismiss={handleDismiss} />
      <header className="page-header">
        <Link to="/" className="ghost-button">
          Back
        </Link>
        <h2>All expenses</h2>
      </header>

      <div className="segmented">
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
            <motion.div
              key={group.category}
              className="card expenses__group"
              layout={!shouldReduceMotion}
            >
              <MotionButton
                className="expenses__group-header"
                onClick={() => toggleExpand(group.category)}
                aria-expanded={expanded.has(group.category)}
                aria-controls={`expenses-group-${group.category}`}
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
              </MotionButton>
              <AnimatePresence initial={false}>
                {expanded.has(group.category) && (
                  <motion.div
                    className="expenses__items"
                    id={`expenses-group-${group.category}`}
                    initial={expandMotion.initial}
                    animate={expandMotion.animate}
                    exit={expandMotion.exit}
                    style={{ originY: 0 }}
                  >
                    <AnimatePresence mode="popLayout">
                      {group.group.map((expense) => (
                        <motion.div
                          key={expense.id}
                          className="expenses__item"
                          layout={!shouldReduceMotion}
                          initial={{ opacity: 0, y: itemOffset }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: itemOffset }}
                        >
                          <div>
                            <div className="expenses__item-note">
                              {expense.note || "No note"}
                            </div>
                            <div className="expenses__item-date">
                              {new Date(expense.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="expenses__item-meta">
                            <div className="expenses__item-amount">
                              {formatILS(expense.amountAgorot)}
                            </div>
                            <div className="expenses__item-actions">
                              <MotionButton
                                className="ghost-button ghost-button--small"
                                onClick={(event) => {
                                  setReturnFocusEl(event.currentTarget);
                                  setEditingExpense(expense);
                                }}
                              >
                                Edit
                              </MotionButton>
                              <MotionButton
                                className="ghost-button ghost-button--small ghost-button--danger"
                                onClick={() => handleDelete(expense)}
                              >
                                Delete
                              </MotionButton>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      <ExpenseSheet
        open={Boolean(editingExpense)}
        title="Edit expense"
        submitLabel="Save changes"
        initialExpense={editingExpense}
        onClose={() => setEditingExpense(null)}
        onSubmit={handleEditSubmit}
        returnFocusEl={returnFocusEl}
      />
    </div>
  );
};

export default Expenses;
