import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "motion/react";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { ExpenseServiceProvider } from "./services/ExpenseServiceContext";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ExpenseServiceProvider>
        <MotionConfig reducedMotion="user">
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </MotionConfig>
      </ExpenseServiceProvider>
    </BrowserRouter>
  </React.StrictMode>
);
