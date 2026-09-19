import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useTransactions } from "../hooks/useTransactions.js";
import { formatAmount, summarize } from "../utils/format.js";

const COLORS = ["#4f7cff", "#22a67a", "#f0a030", "#e0587a", "#8b6cf0", "#2fb5c9"];

export default function StatisticsPage() {
  const { transactions, error } = useTransactions();

  if (error) {
    return (
      <>
        <h1>Statistics</h1>
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      </>
    );
  }

  if (!transactions) {
    return (
      <>
        <h1>Statistics</h1>
        <p className="muted">Loading...</p>
      </>
    );
  }

  if (transactions.length === 0) {
    return (
      <>
        <h1>Statistics</h1>
        <div className="card empty">
          <p>There is nothing to chart yet.</p>
          <Link to="/add-transaction">Add a transaction</Link>
        </div>
      </>
    );
  }

  const { income, expense, balance } = summarize(transactions);
  const incomeVsExpense = [
    { name: "Income", amount: income },
    { name: "Expense", amount: expense },
  ];

  const expensesByCategory = Object.entries(
    transactions
      .filter((t) => t.type === "Expense")
      .reduce((totals, t) => ({ ...totals, [t.category]: (totals[t.category] ?? 0) + t.amount }), {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <>
      <h1>Statistics</h1>

      <div className="grid stats">
        <div className="card stat">
          <span className="muted">Income</span>
          <strong className="amount-income">{formatAmount(income)}</strong>
        </div>
        <div className="card stat">
          <span className="muted">Expenses</span>
          <strong className="amount-expense">{formatAmount(expense)}</strong>
        </div>
        <div className="card stat">
          <span className="muted">Balance</span>
          <strong className={balance >= 0 ? "amount-income" : "amount-expense"}>{formatAmount(balance)}</strong>
        </div>
      </div>

      <div className="grid charts">
        <section className="card">
          <h2>Income vs expense</h2>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpense}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatAmount(value)} />
                <Bar dataKey="amount">
                  <Cell fill="#22a67a" />
                  <Cell fill="#e0587a" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card">
          <h2>Expenses by category</h2>
          {expensesByCategory.length === 0 ? (
            <p className="muted">No expenses recorded yet.</p>
          ) : (
            <div className="chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expensesByCategory} dataKey="value" nameKey="name" outerRadius="75%">
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatAmount(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
