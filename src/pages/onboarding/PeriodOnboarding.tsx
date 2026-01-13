import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenseService } from "../../services/ExpenseServiceContext";
import type { Period } from "../../types";
import "../../styles/onboarding.css";

const PERIOD_OPTIONS: { value: Period; label: string; helper: string }[] = [
  { value: "daily", label: "Daily", helper: "Reset every day" },
  { value: "weekly", label: "Weekly", helper: "Reset every week" },
  { value: "monthly", label: "Monthly", helper: "Reset every month" }
];

const PeriodOnboarding = () => {
  const navigate = useNavigate();
  const { settings, saveSettings } = useExpenseService();
  const [selected, setSelected] = useState<Period | null>(settings?.period ?? null);

  const handleSelect = (period: Period) => {
    setSelected(period);
  };

  const handleContinue = async () => {
    if (!selected) {
      return;
    }

    await saveSettings({
      period: selected,
      amountAgorot: settings?.amountAgorot ?? 0,
      startOfWeek: 0
    });
    navigate("/onboarding/budget");
  };

  return (
    <div className="app-shell onboarding">
      <h1>Choose your period</h1>
      <div className="onboarding__options">
        {PERIOD_OPTIONS.map((option) => (
          <button
            key={option.value}
            className="onboarding__card"
            onClick={() => handleSelect(option.value)}
          >
            <div>
              <h3>{option.label}</h3>
              <p>{option.helper}</p>
            </div>
          </button>
        ))}
      </div>
      <button
        className="primary-button"
        disabled={!selected}
        onClick={handleContinue}
      >
        Continue
      </button>
    </div>
  );
};

export default PeriodOnboarding;
