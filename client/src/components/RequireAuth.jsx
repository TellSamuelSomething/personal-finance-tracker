import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/useAuth.js";

/** Pages inside this route are only shown to signed-in users. */
export default function RequireAuth() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
