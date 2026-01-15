import { Link, Navigate, useNavigate } from "react-router-dom";
import { useExpenseService } from "../services/ExpenseServiceContext";
import { formatILS } from "../utils/money";
import "../styles/settings.css";

const Settings = () => {
  const { settings, clearAll, refresh } = useExpenseService();
  const navigate = useNavigate();

  if (!settings) {
    return <Navigate to="/onboarding/period" replace />;
  }

  const handleReset = async () => {
    await clearAll();
    await refresh();
    navigate("/onboarding/period");
  };

  return (
    <div className="app-shell settings">
      <header className="page-header">
        <Link to="/" className="ghost-button">
          Back
        </Link>
        <h2>Settings</h2>
      </header>

      <div className="card settings__card">
        <div>
          <div className="settings__label">Budget period</div>
          <div className="settings__value">{settings.period}</div>
        </div>
        <div>
          <div className="settings__label">Budget amount</div>
          <div className="settings__value">{formatILS(settings.amountAgorot)}</div>
        </div>
      </div>

      <button className="ghost-button settings__reset" onClick={handleReset}>
        Reset onboarding
      </button>
    </div>
  );
};

export default Settings;
