import { NavLink } from "react-router-dom";

import { useAuth } from "../context/useAuth.js";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/transactions", label: "Transactions" },
  { to: "/add-transaction", label: "Add" },
  { to: "/statistics", label: "Statistics" },
];

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <span className="brand">Finance Tracker</span>

        <nav className="nav-links" aria-label="Main">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-user">
          <span className="muted">{user.username}</span>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
