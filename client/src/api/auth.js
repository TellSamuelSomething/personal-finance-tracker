import { apiFetch } from "./client.js";

export const login = (username, password) =>
  apiFetch("/api/auth/login", { method: "POST", body: { username, password }, auth: false });

export const register = (username, password) =>
  apiFetch("/api/auth/register", { method: "POST", body: { username, password }, auth: false });
