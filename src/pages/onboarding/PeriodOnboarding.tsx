import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import MotionButton from "../../components/MotionButton";
import OnboardingSteps from "../../components/OnboardingSteps";
import { useExpenseService } from "../../services/ExpenseServiceContext";
import type { Period } from "../../types";
import { useMotionPreference } from "../../utils/animation";
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
  const { baseTransition, shouldReduceMotion } = useMotionPreference();

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
      <OnboardingSteps currentStep={1} totalSteps={2} />
      <h1>Choose your period</h1>
      <div className="onboarding__options">
        {PERIOD_OPTIONS.map((option) => (
          <motion.button
            key={option.value}
            className={`onboarding__card${selected === option.value ? " onboarding__card--selected" : ""}`}
            onClick={() => handleSelect(option.value)}
            aria-pressed={selected === option.value}
            type="button"
            transition={baseTransition}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
          >
            <div>
              <h3>{option.label}</h3>
              <p>{option.helper}</p>
            </div>
          </motion.button>
        ))}
      </div>
      <MotionButton
        className="primary-button"
        disabled={!selected}
        onClick={handleContinue}
      >
        Continue
      </MotionButton>
    </div>
  );
};

export default PeriodOnboarding;
