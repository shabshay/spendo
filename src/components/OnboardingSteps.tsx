import { motion } from "motion/react";
import { useMotionPreference } from "../utils/animation";
import "../styles/onboarding.css";

interface OnboardingStepsProps {
  currentStep: number;
  totalSteps: number;
}

const OnboardingSteps = ({ currentStep, totalSteps }: OnboardingStepsProps) => {
  const { shouldReduceMotion, fastTransition } = useMotionPreference();

  return (
    <div className="onboarding__steps" aria-label={`Step ${currentStep} of ${totalSteps}`}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const isActive = index + 1 === currentStep;
        return (
          <motion.span
            key={`step-${index}`}
            className={`onboarding__step${isActive ? " onboarding__step--active" : ""}`}
            animate={{
              opacity: isActive ? 1 : 0.45,
              scaleX: isActive ? 1 : 0.7
            }}
            transition={shouldReduceMotion ? { duration: 0.01 } : fastTransition}
          />
        );
      })}
    </div>
  );
};

export default OnboardingSteps;
