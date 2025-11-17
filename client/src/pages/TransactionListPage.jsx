import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function TransactionListPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const response = await fetch("http://localhost:5000/api/transactions");
      const data = await response.json();
      setTransactions(data);
    };
    fetchTransactions();
  }, []);

const handleDelete = async (id) => {
  const confirmed = window.confirm("Are you sure you want to delete this transaction?");
  if (!confirmed) return; // ❌ user cancelled → do nothing

  try {
    const response = await fetch(`http://localhost:5000/api/transactions/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Delete failed");
      return;
    }

    // Remove from UI after backend confirms
    setTransactions((prev) => prev.filter((t) => t._id !== id));
  } catch (err) {
    console.error("Delete failed:", err);
  }
};


  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Your Transactions</h1>

      <table style={{ width: "80%", margin: "auto" }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t._id}>
              <td>{t.date?.split("T")[0]}</td>
              <td>{t.type}</td>
              <td>{t.category}</td>
              <td style={{ color: t.type === "Expense" ? "red" : "green" }}>
                {t.amount}
              </td>
              <td>
                <button
                  onClick={() => handleDelete(t._id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "20px",
                    color: "red",
                  }}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={() => navigate("/dashboard")}>Back</button>
    </div>
  );
}
