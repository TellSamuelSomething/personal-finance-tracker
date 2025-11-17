import React from "react";
import { Routes, Route } from "react-router-dom"; // ✅ Needed for routing
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AddTransactionPage from "./pages/AddTransactionPage";
import TransactionListPage from "./pages/TransactionListPage";
import Statistics from "./pages/StatisticsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/add-transaction" element={<AddTransactionPage />} />
      <Route path="/transactions" element={<TransactionListPage />} />
      <Route path="/statistics" element={<Statistics />} />
    </Routes>
  );
}

export default App;
