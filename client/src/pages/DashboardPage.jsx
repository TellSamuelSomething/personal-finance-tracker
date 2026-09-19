import { Link } from "react-router-dom";

import { useAuth } from "../context/useAuth.js";

const actions = [
  { to: "/add-transaction", title: "Add transaction", text: "Record income or an expense." },
  { to: "/transactions", title: "View transactions", text: "See, review and delete your entries." },
  { to: "/statistics", title: "View statistics", text: "Compare income and expenses with charts." },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <>
      <h1>Hello, {user.username}</h1>
      <p className="muted">Choose what you would like to do today.</p>

      <div className="grid">
        {actions.map(({ to, title, text }) => (
          <Link key={to} to={to} className="card action-card">
            <h2>{title}</h2>
            <p className="muted">{text}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
