import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import ProgressRing from "../components/ProgressRing";
import ToastStack, { type ToastMessage } from "../components/ToastStack";
import ExpenseSheet from "../components/ExpenseSheet";
import MotionButton from "../components/MotionButton";
import { CATEGORY_LABELS } from "../constants/categories";
import { getPeriodWindow, formatCountdownToReset } from "../domain/period";
import { useExpenseService } from "../services/ExpenseServiceContext";
import type { Expense } from "../types";
import { formatILS } from "../utils/money";
import { useMotionPreference } from "../utils/animation";
import "../styles/home.css";

const MotionLink = motion(Link);

const Home = () => {
  const {
    settings,
    expenses,
    deleteExpense,
    restoreExpense,
    updateExpense,
    storageWarning
  } = useExpenseService();
  const [activeTab, setActiveTab] = useState<"expenses" | "reports">("expenses");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [returnFocusEl, setReturnFocusEl] = useState<HTMLElement | null>(null);
  const { shouldReduceMotion, fastTransition } = useMotionPreference();
  const location = useLocation();
  const navigate = useNavigate();

  if (!settings) {
    return null;
  }

  const now = new Date();
  const { start, end } = getPeriodWindow(now, settings.period, settings.startOfWeek);
  const periodLabel =
    settings.period === "daily"
      ? "today"
      : settings.period === "weekly"
        ? "this week"
        : "this month";
  const spentInPeriod = expenses
    .filter((expense) => {
      const created = new Date(expense.createdAt).getTime();
      return created >= start.getTime() && created < end.getTime();
    })
    .reduce((total, expense) => total + expense.amountAgorot, 0);
  const leftInPeriod = settings.amountAgorot - spentInPeriod;
  const countdown = formatCountdownToReset(now, settings.period, settings.startOfWeek);

  useEffect(() => {
    const restoreFocusId = (location.state as { restoreFocusId?: string } | null)
      ?.restoreFocusId;
    if (restoreFocusId) {
      const focusTarget = document.getElementById(restoreFocusId);
      focusTarget?.focus();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    const ratio = settings.amountAgorot > 0 ? spentInPeriod / settings.amountAgorot : 0;
    setToasts((prev) => {
      const next = prev.filter((toast) => !toast.id.startsWith("budget-"));
      if (ratio >= 1) {
        next.push({
          id: "budget-error",
          type: "error",
          message: `You exceeded your limit by ${formatILS(Math.abs(leftInPeriod))}`
        });
      } else if (ratio >= 0.8) {
        next.push({
          id: "budget-warning",
          type: "warning",
          message: "You're close to your limit"
        });
      }
      return next;
    });
  }, [spentInPeriod, settings.amountAgorot, leftInPeriod]);

  useEffect(() => {
    if (!storageWarning) return;
    setToasts((prev) => {
      if (prev.some((toast) => toast.id === "storage-warning")) return prev;
      return [
        ...prev,
        {
          id: "storage-warning",
          type: "info",
          message: storageWarning
        }
      ];
    });
  }, [storageWarning]);

  const recentExpenses = expenses.slice(0, 5);

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

  const listOffset = shouldReduceMotion ? 0 : 10;

  return (
    <div className="app-shell home">
      <ToastStack toasts={toasts} onDismiss={handleDismiss} />
      <header className="home__header">
        <div>
          <h1>Spendo</h1>
          <p>Spend like it’s cash.</p>
        </div>
        <Link className="home__settings" to="/settings" aria-label="Settings">
          ⚙️
        </Link>
      </header>

      <ProgressRing
        spentAgorot={spentInPeriod}
        budgetAgorot={settings.amountAgorot}
        periodLabel={periodLabel}
      />

      <div className="home__countdown">Resets in {countdown}</div>

      <MotionLink
        to="/add"
        className="primary-button home__add"
        state={{ returnFocusId: "add-expense-trigger" }}
        id="add-expense-trigger"
        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      >
        + Add expense
      </MotionLink>

      <div className="home__tabs">
        <MotionButton
          className={activeTab === "expenses" ? "active" : ""}
          onClick={() => setActiveTab("expenses")}
        >
          All Expenses
        </MotionButton>
        <MotionButton
          className={activeTab === "reports" ? "active" : ""}
          onClick={() => setActiveTab("reports")}
        >
          Reports
        </MotionButton>
      </div>

      {activeTab === "expenses" ? (
        <div className="home__section">
          <div className="section-title">Recent expenses</div>
          {recentExpenses.length === 0 ? (
            <div className="card home__empty">
              No expenses yet. Start tracking your spending.
            </div>
          ) : (
            <motion.div className="home__list" layout={!shouldReduceMotion}>
              <AnimatePresence mode="popLayout">
                {recentExpenses.map((expense) => (
                  <motion.div
                    key={expense.id}
                    className="home__item card"
                    layout={!shouldReduceMotion}
                    initial={{ opacity: 0, y: listOffset }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: listOffset }}
                    transition={fastTransition}
                  >
                    <div>
                      <div className="home__item-title">
                        {CATEGORY_LABELS[expense.category]}
                      </div>
                      <div className="home__item-sub">
                        {new Date(expense.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="home__item-meta">
                      <div className="home__item-amount">
                        {formatILS(expense.amountAgorot)}
                      </div>
                      <div className="home__item-actions">
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
          <Link className="home__link" to="/expenses">
            View all expenses
          </Link>
        </div>
      ) : (
        <div className="home__section">
          <div className="section-title">Reports snapshot</div>
          <div className="card home__summary">
            <div>
              <span className="tag">Spent</span>
              <div className="home__summary-value">{formatILS(spentInPeriod)}</div>
            </div>
            <div>
              <span className="tag">Left</span>
              <div className="home__summary-value">{formatILS(leftInPeriod)}</div>
            </div>
          </div>
          <Link className="home__link" to="/reports">
            Open reports
          </Link>
        </div>
      )}

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

export default Home;
