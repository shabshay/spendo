import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { formatILS } from "../utils/money";
import { useMotionPreference } from "../utils/animation";
import "../styles/progressRing.css";

interface ProgressRingProps {
  spentAgorot: number;
  budgetAgorot: number;
  periodLabel: string;
}

const ProgressRing = ({ spentAgorot, budgetAgorot, periodLabel }: ProgressRingProps) => {
  const { slowTransition, shouldReduceMotion } = useMotionPreference();
  const radius = 86;
  const circumference = 2 * Math.PI * radius;
  const ratio = budgetAgorot > 0 ? Math.min(spentAgorot / budgetAgorot, 1) : 0;
  const strokeDashoffset = circumference * (1 - ratio);
  const leftAgorot = budgetAgorot - spentAgorot;
  const leftLabel = leftAgorot >= 0 ? formatILS(leftAgorot) : `-${formatILS(Math.abs(leftAgorot))}`;

  const ringStyle: CSSProperties = {
    strokeDasharray: circumference,
    strokeDashoffset
  };

  return (
    <div className="progress-ring card">
      <div className="progress-ring__chart">
        <svg width="220" height="220">
          <defs>
            <linearGradient id="progress-ring-gradient" x1="0" y1="0" x2="220" y2="220">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#312e81" />
            </linearGradient>
          </defs>
          <circle
            className="progress-ring__bg"
            cx="110"
            cy="110"
            r={radius}
            strokeWidth="18"
            strokeLinecap="round"
          />
          <motion.circle
            className="progress-ring__value"
            cx="110"
            cy="110"
            r={radius}
            strokeWidth="18"
            strokeLinecap="round"
            style={ringStyle}
            animate={{ strokeDashoffset }}
            initial={false}
            transition={shouldReduceMotion ? { duration: 0 } : slowTransition}
          />
        </svg>
        <div className="progress-ring__label">
          <span className="progress-ring__amount">{leftLabel}</span>
          <span className="progress-ring__sub">left {periodLabel}</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressRing;
