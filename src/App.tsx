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
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            hasSettings ? (
              <PageTransition>
                <Home />
              </PageTransition>
            ) : (
              <Navigate to="/onboarding/period" />
            )
          }
        />
        <Route
          path="/onboarding/period"
          element={
            <PageTransition>
              <PeriodOnboarding />
            </PageTransition>
          }
        />
        <Route
          path="/onboarding/budget"
          element={
            <PageTransition>
              <BudgetOnboarding />
            </PageTransition>
          }
        />
        <Route
          path="/add"
          element={
            hasSettings ? (
              <PageTransition>
                <AddExpense />
              </PageTransition>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/expenses"
          element={
            hasSettings ? (
              <PageTransition>
                <Expenses />
              </PageTransition>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/reports"
          element={
            hasSettings ? (
              <PageTransition>
                <Reports />
              </PageTransition>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/settings"
          element={
            <PageTransition>
              <Settings />
            </PageTransition>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
