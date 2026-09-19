import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import AddTransactionPage from "./pages/AddTransactionPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import StatisticsPage from "./pages/StatisticsPage.jsx";
import TransactionListPage from "./pages/TransactionListPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/add-transaction" element={<AddTransactionPage />} />
          <Route path="/transactions" element={<TransactionListPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
