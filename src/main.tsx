import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { ExpenseServiceProvider } from "./services/ExpenseServiceContext";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <ExpenseServiceProvider>
        <App />
      </ExpenseServiceProvider>
    </HashRouter>
  </React.StrictMode>
);
