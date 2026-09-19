import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { register } from "../api/auth.js";
import { ApiError } from "../api/client.js";
import { useAuth } from "../context/useAuth.js";

/** Shared form for the login and register pages. */
export default function AuthForm({ mode }) {
  const isLogin = mode === "login";
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});

    try {
      if (isLogin) {
        await login(username, password);
        navigate("/dashboard", { replace: true });
      } else {
        await register(username, password);
        await login(username, password);
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.errors);
      } else {
        setError("Something went wrong");
      }
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit} noValidate>
        <h1>{isLogin ? "Log in" : "Create account"}</h1>
        <p className="muted">{isLogin ? "Welcome back to Finance Tracker." : "Start tracking your income and expenses."}</p>

        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            required
          />
          {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
          />
          {fieldErrors.password ? (
            <span className="field-error">{fieldErrors.password}</span>
          ) : (
            !isLogin && <span className="hint">At least 8 characters.</span>
          )}
        </label>

        {error && !Object.keys(fieldErrors).length && (
          <p className="alert alert-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Please wait..." : isLogin ? "Log in" : "Register"}
        </button>

        <p className="muted center">
          {isLogin ? (
            <>
              No account yet? <Link to="/register">Register</Link>
            </>
          ) : (
            <>
              Already have an account? <Link to="/login">Log in</Link>
            </>
          )}
        </p>
      </form>
    </main>
  );
}
