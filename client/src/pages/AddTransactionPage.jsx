import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddTransactionPage() {
  const navigate = useNavigate();

  const [type, setType] = useState("Income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newTransaction = { type, amount: Number(amount), category, date };

    try {
      const response = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTransaction),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to add transaction");
        return;
      }

      alert("Transaction added!");
      navigate("/transactions");
    } catch (error) {
      console.error(error);
      alert("Error connecting to server");
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Add New Transaction</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "350px",
          margin: "1rem auto",
          gap: "1rem",
        }}
      >
        {/* Type */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ padding: "0.5rem" }}
        >
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>

        {/* Amount */}
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          style={{ padding: "0.5rem" }}
        />

        {/* Category */}
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          style={{ padding: "0.5rem" }}
        />

        {/* Date */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={{ padding: "0.5rem" }}
        />

        {/* Submit */}
        <button
          type="submit"
          style={{
            padding: "0.7rem",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ➕ Add Transaction
        </button>
      </form>

      {/* Back button */}
      <button
        onClick={() => navigate("/dashboard")}
        style={{ padding: "0.5rem 1rem", marginTop: "1rem", cursor: "pointer" }}
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}
