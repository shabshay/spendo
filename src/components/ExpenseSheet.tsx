import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import type { Category, Expense } from "../types";
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from "../constants/categories";
import { formatILS, parseILS } from "../utils/money";
import { useMotionPreference } from "../utils/animation";
import MotionButton from "./MotionButton";
import ModalSheet from "./ModalSheet";
import "../styles/expenseSheet.css";

interface ExpenseSheetProps {
  open: boolean;
  title: string;
  submitLabel: string;
  initialExpense?: Expense | null;
  onClose: () => void;
  onSubmit: (data: Omit<Expense, "id" | "createdAt">) => Promise<void> | void;
  returnFocusEl?: HTMLElement | null;
}

const ExpenseSheet = ({
  open,
  title,
  submitLabel,
  initialExpense,
  onClose,
  onSubmit,
  returnFocusEl
}: ExpenseSheetProps) => {
  const { baseTransition } = useMotionPreference();
  const [amountInput, setAmountInput] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [note, setNote] = useState("");
  const amountRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setAmountInput(initialExpense ? (initialExpense.amountAgorot / 100).toString() : "");
    setCategory(initialExpense?.category ?? "");
    setNote(initialExpense?.note ?? "");
  }, [open, initialExpense]);

  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(() => amountRef.current?.focus(), 40);
    return () => window.clearTimeout(timeout);
  }, [open]);

  const amountAgorot = useMemo(() => parseILS(amountInput), [amountInput]);
  const isValid = amountAgorot > 0 && category !== "";

  const handleSubmit = async () => {
    if (!isValid) return;
    await onSubmit({
      amountAgorot,
      category: category as Category,
      note: note || undefined
    });
    onClose();
  };

  return (
    <ModalSheet
      open={open}
      onClose={onClose}
      ariaLabel={title}
      returnFocusEl={returnFocusEl}
      contentClassName="expense-sheet"
    >
      <div className="expense-sheet__header">
        <h2>{title}</h2>
        <MotionButton
          className="ghost-button expense-sheet__close"
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          ✕
        </MotionButton>
      </div>

      <div className="card expense-sheet__card">
        <label className="expense-sheet__label" htmlFor="expense-amount">
          Amount
        </label>
        <input
          ref={amountRef}
          id="expense-amount"
          className="input-field"
          inputMode="decimal"
          placeholder="₪0"
          value={amountInput}
          onChange={(event) => setAmountInput(event.target.value)}
        />
        <div className="expense-sheet__preview">
          {amountAgorot > 0 ? formatILS(amountAgorot) : "₪0"}
        </div>

        <div className="expense-sheet__label">Pick a category</div>
        <div className="expense-sheet__categories" role="group" aria-label="Expense categories">
          {CATEGORY_OPTIONS.map((option) => (
            <motion.button
              key={option}
              className={category === option ? "active" : ""}
              onClick={() => setCategory(option)}
              type="button"
              animate={{
                opacity: category === option ? 1 : 0.8
              }}
              transition={baseTransition}
            >
              {CATEGORY_LABELS[option]}
            </motion.button>
          ))}
        </div>

        <label className="expense-sheet__label" htmlFor="expense-note">
          Note (optional)
        </label>
        <input
          id="expense-note"
          className="input-field"
          placeholder="Coffee at Aroma"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>

      <MotionButton className="primary-button" disabled={!isValid} onClick={handleSubmit}>
        {submitLabel}
      </MotionButton>
    </ModalSheet>
  );
};

export default ExpenseSheet;
