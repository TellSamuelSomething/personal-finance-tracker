import { useState } from "react";
import { Link } from "react-router-dom";

import { ApiError } from "../api/client.js";
import { useTransactions } from "../hooks/useTransactions.js";
import { formatAmount, formatDate } from "../utils/format.js";

export default function TransactionListPage() {
  const { transactions, error, remove } = useTransactions();
  const [deleteError, setDeleteError] = useState(null);

  async function handleDelete(transaction) {
    if (!window.confirm(`Delete the ${transaction.category} transaction of ${formatAmount(transaction.amount)}?`)) return;

    setDeleteError(null);
    try {
      await remove(transaction._id);
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Could not delete the transaction");
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>Transactions</h1>
        <Link to="/add-transaction" className="btn btn-primary">
          Add transaction
        </Link>
      </div>

      {error && (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      )}
      {deleteError && (
        <p className="alert alert-error" role="alert">
          {deleteError}
        </p>
      )}
      {!transactions && !error && <p className="muted">Loading...</p>}

      {transactions && transactions.length === 0 && (
        <div className="card empty">
          <p>No transactions yet.</p>
          <Link to="/add-transaction">Add your first one</Link>
        </div>
      )}

      {transactions && transactions.length > 0 && (
        <div className="card table-card">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th className="num">Amount</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id}>
                  <td>{formatDate(t.date)}</td>
                  <td>
                    <span className={`badge badge-${t.type.toLowerCase()}`}>{t.type}</span>
                  </td>
                  <td>{t.category}</td>
                  <td className={`num amount-${t.type.toLowerCase()}`}>
                    {t.type === "Expense" ? "-" : "+"}
                    {formatAmount(t.amount)}
                  </td>
                  <td className="num">
                    <button type="button" className="btn btn-danger" onClick={() => handleDelete(t)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
