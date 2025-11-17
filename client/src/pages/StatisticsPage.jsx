import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  PieChart, Pie, Cell
} from "recharts";

export default function StatisticsPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch("http://localhost:5000/api/transactions");
      const data = await res.json();
      setTransactions(data);
    };

    fetchStats();
  }, []);

  // Prepare data for Income vs Expense chart
  const totalIncome = transactions
    .filter(t => t.type === "Income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const incomeExpenseData = [
    { name: "Income", amount: totalIncome },
    { name: "Expense", amount: totalExpense }
  ];

  // Prepare data for Category Pie Chart
  const categories = {};

  transactions.forEach(t => {
    if (t.type === "Expense") {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    }
  });

  const categoryData = Object.entries(categories).map(([key, value]) => ({
    name: key,
    value
  }));

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#ff6666"];

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Financial Statistics</h1>

      <h2>Income vs Expense</h2>
      <BarChart width={500} height={300} data={incomeExpenseData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="amount" fill="#82ca9d" />
      </BarChart>

      <h2>Expenses by Category</h2>
      <PieChart width={500} height={350}>
        <Pie
          data={categoryData}
          cx="50%"
          cy="50%"
          outerRadius={120}
          dataKey="value"
          label
        >
          {categoryData.map((entry, index) => (
            <Cell key={index} fill={colors[index % colors.length]} />
          ))}
        </Pie>
      </PieChart>

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          padding: "0.5rem 1rem",
          marginTop: "1.5rem",
          cursor: "pointer",
        }}
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}
