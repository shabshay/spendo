import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { useExpenseService } from "./services/ExpenseServiceContext";
import PeriodOnboarding from "./pages/onboarding/PeriodOnboarding";
import BudgetOnboarding from "./pages/onboarding/BudgetOnboarding";
import Home from "./pages/Home";
import AddExpense from "./pages/AddExpense";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import PageTransition from "./components/PageTransition";

const App = () => {
  const { settings, isLoading } = useExpenseService();
  const location = useLocation();

  if (isLoading) {
    return <div className="app-loading">Loading Spendo...</div>;
  }

  const hasSettings = Boolean(settings);

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Routes location={location}>
          <Route
            path="/"
            element={
              hasSettings ? <Home /> : <Navigate to="/onboarding/period" />
            }
          />
          <Route path="/onboarding/period" element={<PeriodOnboarding />} />
          <Route path="/onboarding/budget" element={<BudgetOnboarding />} />
          <Route
            path="/add"
            element={hasSettings ? <AddExpense /> : <Navigate to="/" />}
          />
          <Route
            path="/expenses"
            element={hasSettings ? <Expenses /> : <Navigate to="/" />}
          />
          <Route
            path="/reports"
            element={hasSettings ? <Reports /> : <Navigate to="/" />}
          />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  );
};

export default App;
