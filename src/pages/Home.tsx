import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProgressRing from "../components/ProgressRing";
import ToastStack, { type ToastMessage } from "../components/ToastStack";
import { CATEGORY_LABELS } from "../constants/categories";
import { getPeriodWindow, formatCountdownToReset } from "../domain/period";
import { useExpenseService } from "../services/ExpenseServiceContext";
import { formatILS } from "../utils/money";
import "../styles/home.css";

const Home = () => {
  const { settings, expenses } = useExpenseService();
  const [activeTab, setActiveTab] = useState<"expenses" | "reports">("expenses");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lastAlert, setLastAlert] = useState<"warning" | "error" | null>(null);

  if (!settings) {
    return null;
  }

  const now = new Date();
  const { start, end } = getPeriodWindow(now, settings.period, settings.startOfWeek);
  const periodLabel = settings.period === "daily" ? "today" : settings.period === "weekly" ? "this week" : "this month";
  const spentInPeriod = expenses
    .filter((expense) => {
      const created = new Date(expense.createdAt).getTime();
      return created >= start.getTime() && created < end.getTime();
    })
    .reduce((total, expense) => total + expense.amountAgorot, 0);
  const leftInPeriod = settings.amountAgorot - spentInPeriod;
  const countdown = formatCountdownToReset(now, settings.period, settings.startOfWeek);

  useEffect(() => {
    const ratio = settings.amountAgorot > 0 ? spentInPeriod / settings.amountAgorot : 0;
    if (ratio >= 1 && lastAlert !== "error") {
      setToasts((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: "error",
          message: `You exceeded your limit by ${formatILS(Math.abs(leftInPeriod))}`
        }
      ]);
      setLastAlert("error");
    } else if (ratio >= 0.8 && lastAlert !== "warning") {
      setToasts((prev) => [
        ...prev,
        {
          id: `warn-${Date.now()}`,
          type: "warning",
          message: "You're close to your limit"
        }
      ]);
      setLastAlert("warning");
    }
  }, [spentInPeriod, settings.amountAgorot, leftInPeriod, lastAlert]);

  const recentExpenses = expenses.slice(0, 5);

  const handleDismiss = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

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

      <Link to="/add" className="primary-button home__add">
        + Add expense
      </Link>

      <div className="home__tabs">
        <button
          className={activeTab === "expenses" ? "active" : ""}
          onClick={() => setActiveTab("expenses")}
        >
          All Expenses
        </button>
        <button
          className={activeTab === "reports" ? "active" : ""}
          onClick={() => setActiveTab("reports")}
        >
          Reports
        </button>
      </div>

      {activeTab === "expenses" ? (
        <div className="home__section">
          <div className="section-title">Recent expenses</div>
          {recentExpenses.length === 0 ? (
            <div className="card home__empty">
              No expenses yet. Start tracking your spending.
            </div>
          ) : (
            <div className="home__list">
              {recentExpenses.map((expense) => (
                <div key={expense.id} className="home__item card">
                  <div>
                    <div className="home__item-title">
                      {CATEGORY_LABELS[expense.category]}
                    </div>
                    <div className="home__item-sub">
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="home__item-amount">
                    {formatILS(expense.amountAgorot)}
                  </div>
                </div>
              ))}
            </div>
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
    </div>
  );
};

export default Home;
