import { useEffect } from "react";

export interface ToastMessage {
  id: string;
  type: "warning" | "error";
  message: string;
}

interface ToastStackProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ToastStack = ({ toasts, onDismiss }: ToastStackProps) => {
  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((toast) =>
      setTimeout(() => onDismiss(toast.id), 3500)
    );
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default ToastStack;
