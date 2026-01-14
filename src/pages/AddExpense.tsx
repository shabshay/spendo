import { useLocation, useNavigate } from "react-router-dom";
import ExpenseSheet from "../components/ExpenseSheet";
import { useExpenseService } from "../services/ExpenseServiceContext";
import type { Expense } from "../types";

const AddExpense = () => {
  const { addExpense } = useExpenseService();
  const navigate = useNavigate();
  const location = useLocation();
  const returnFocusId = (location.state as { returnFocusId?: string } | null)
    ?.returnFocusId;

  const handleSubmit = async (expense: Omit<Expense, "id" | "createdAt">) => {
    await addExpense({
      amountAgorot: expense.amountAgorot,
      category: expense.category,
      note: expense.note
    });
  };

  return (
    <ExpenseSheet
      open
      title="Add expense"
      submitLabel="Save expense"
      onClose={() => navigate("/", { state: { restoreFocusId: returnFocusId } })}
      onSubmit={handleSubmit}
      returnFocusEl={returnFocusId ? document.getElementById(returnFocusId) : null}
    />
  );
};

export default AddExpense;
