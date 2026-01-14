import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMotionPreference } from "../utils/animation";

export interface ToastMessage {
  id: string;
  type: "warning" | "error" | "info";
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
}

interface ToastStackProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ToastStack = ({ toasts, onDismiss }: ToastStackProps) => {
  const { shouldReduceMotion, baseTransition } = useMotionPreference();

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((toast) =>
      setTimeout(() => onDismiss(toast.id), toast.durationMs ?? 3500)
    );
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts, onDismiss]);

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`toast ${toast.type}`}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
            transition={baseTransition}
          >
            <span>{toast.message}</span>
            {toast.actionLabel && toast.onAction && (
              <button
                className="toast__action"
                onClick={() => toast.onAction?.()}
                type="button"
              >
                {toast.actionLabel}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastStack;
