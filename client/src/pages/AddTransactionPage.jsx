import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ApiError } from "../api/client.js";
import { createTransaction } from "../api/transactions.js";
import { todayInputValue } from "../utils/format.js";

const CATEGORY_SUGGESTIONS = ["Salary", "Food", "Rent", "Transport", "Entertainment", "Health", "Shopping"];

export default function AddTransactionPage() {
  const navigate = useNavigate();

  const [type, setType] = useState("Expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(todayInputValue);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});

    try {
      await createTransaction({ type, amount: Number(amount), category, date });
      navigate("/transactions");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.errors);
      } else {
        setError("Something went wrong");
      }
      setBusy(false);
    }
  }

  return (
    <>
      <h1>Add transaction</h1>

      <form className="card form-card" onSubmit={handleSubmit} noValidate>
        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
          {fieldErrors.type && <span className="field-error">{fieldErrors.type}</span>}
        </label>

        <label>
          Amount
          <input
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          {fieldErrors.amount && <span className="field-error">{fieldErrors.amount}</span>}
        </label>

        <label>
          Category
          <input
            list="category-suggestions"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            maxLength={50}
            required
          />
          <datalist id="category-suggestions">
            {CATEGORY_SUGGESTIONS.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          {fieldErrors.category && <span className="field-error">{fieldErrors.category}</span>}
        </label>

        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          {fieldErrors.date && <span className="field-error">{fieldErrors.date}</span>}
        </label>

        {error && !Object.keys(fieldErrors).length && (
          <p className="alert alert-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Saving..." : "Add transaction"}
        </button>
      </form>
    </>
  );
}
