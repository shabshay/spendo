import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from "../constants/categories";
import { useExpenseService } from "../services/ExpenseServiceContext";
import type { Category } from "../types";
import { formatILS, parseILS } from "../utils/money";
import "../styles/addExpense.css";

const AddExpense = () => {
  const { addExpense } = useExpenseService();
  const navigate = useNavigate();
  const [amountInput, setAmountInput] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [note, setNote] = useState("");

  const amountAgorot = useMemo(() => parseILS(amountInput), [amountInput]);
  const isValid = amountAgorot > 0 && category !== "";

  const handleSubmit = async () => {
    if (!isValid) return;
    await addExpense({
      amountAgorot,
      category: category as Category,
      note: note || undefined
    });
    navigate("/");
  };

  return (
    <div className="app-shell add-expense">
      <header className="page-header">
        <Link to="/" className="ghost-button">
          Back
        </Link>
        <h2>Add expense</h2>
      </header>

      <div className="card add-expense__card">
        <label className="add-expense__label">Amount</label>
        <input
          className="input-field"
          inputMode="decimal"
          placeholder="₪0"
          value={amountInput}
          onChange={(event) => setAmountInput(event.target.value)}
        />
        <div className="add-expense__preview">
          {amountAgorot > 0 ? formatILS(amountAgorot) : "₪0"}
        </div>

        <div className="add-expense__label">Pick a category</div>
        <div className="add-expense__categories">
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={option}
              className={category === option ? "active" : ""}
              onClick={() => setCategory(option)}
            >
              {CATEGORY_LABELS[option]}
            </button>
          ))}
        </div>

        <label className="add-expense__label">Note (optional)</label>
        <input
          className="input-field"
          placeholder="Coffee at Aroma"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>

      <button className="primary-button" disabled={!isValid} onClick={handleSubmit}>
        Save expense
      </button>
    </div>
  );
};

export default AddExpense;
