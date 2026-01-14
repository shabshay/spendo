import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MotionButton from "../../components/MotionButton";
import OnboardingSteps from "../../components/OnboardingSteps";
import { useExpenseService } from "../../services/ExpenseServiceContext";
import { formatILS, parseILS } from "../../utils/money";
import type { Period } from "../../types";
import "../../styles/onboarding.css";

const QUICK_AMOUNTS = [100, 200, 500];

const periodQuestion: Record<Period, string> = {
  daily: "How much can you spend per day?",
  weekly: "How much can you spend per week?",
  monthly: "How much can you spend per month?"
};

const BudgetOnboarding = () => {
  const navigate = useNavigate();
  const { settings, saveSettings } = useExpenseService();
  const [amountInput, setAmountInput] = useState(
    settings?.amountAgorot ? (settings.amountAgorot / 100).toString() : ""
  );

  useEffect(() => {
    if (!settings) {
      navigate("/onboarding/period");
    }
  }, [settings, navigate]);

  const period = settings?.period ?? "daily";
  const amountAgorot = useMemo(() => parseILS(amountInput), [amountInput]);

  const handleQuickPick = (value: number) => {
    setAmountInput(value.toString());
  };

  const handleSubmit = async () => {
    if (!settings) return;
    await saveSettings({
      ...settings,
      amountAgorot
    });
    navigate("/");
  };

  return (
    <div className="app-shell onboarding">
      <OnboardingSteps currentStep={2} totalSteps={2} />
      <h1>Set your budget</h1>
      <p className="onboarding__question">{periodQuestion[period]}</p>
      <div className="onboarding__amount">
        <input
          className="input-field"
          inputMode="decimal"
          placeholder="₪0"
          value={amountInput}
          onChange={(event) => setAmountInput(event.target.value)}
        />
        <span className="onboarding__amount-preview">
          {amountAgorot > 0 ? formatILS(amountAgorot) : "₪0"}
        </span>
      </div>
      <div className="onboarding__chips">
        {QUICK_AMOUNTS.map((amount) => (
          <MotionButton
            key={amount}
            className="ghost-button"
            onClick={() => handleQuickPick(amount)}
          >
            ₪{amount}
          </MotionButton>
        ))}
      </div>
      <MotionButton
        className="primary-button"
        disabled={amountAgorot <= 0}
        onClick={handleSubmit}
      >
        Get started
      </MotionButton>
    </div>
  );
};

export default BudgetOnboarding;
