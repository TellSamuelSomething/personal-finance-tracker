import { apiFetch } from "./client.js";

export const listTransactions = () => apiFetch("/api/transactions");

export const createTransaction = (transaction) =>
  apiFetch("/api/transactions", { method: "POST", body: transaction });

export const deleteTransaction = (id) => apiFetch(`/api/transactions/${id}`, { method: "DELETE" });
