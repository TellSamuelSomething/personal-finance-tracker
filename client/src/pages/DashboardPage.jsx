import React from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>💰 Finance Tracker Dashboard</h1>
      <p style={{ color: "#555" }}>Welcome! Choose what you'd like to do today.</p>

      <div style={styles.menu}>
        <button style={styles.button} onClick={() => navigate("/add-transaction")}>
          ➕ Add Transaction
        </button>
        <button style={styles.button} onClick={() => navigate("/transactions")}>
          📋 View Transactions
        </button>
        <button style={styles.button} onClick={() => navigate("/statistics")}>
          📊 View Statistics
        </button>
      </div>

      <button style={styles.logoutButton} onClick={handleLogout}>
        🚪 Logout
      </button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "3rem auto",
    textAlign: "center",
    backgroundColor: "#f9f9f9",
    padding: "2rem",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  header: {
    marginBottom: "1rem",
  },
  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginTop: "2rem",
  },
  button: {
    padding: "1rem",
    fontSize: "1.1rem",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  logoutButton: {
    marginTop: "2rem",
    backgroundColor: "#dc3545",
    color: "white",
    padding: "0.8rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};
