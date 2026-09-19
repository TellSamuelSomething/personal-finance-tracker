import { useCallback, useEffect, useMemo, useState } from "react";

import { login as loginRequest } from "../api/auth.js";
import { session, setUnauthorizedHandler } from "../api/client.js";
import { AuthContext } from "./authContext.js";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = session.token();
    return token ? { username: session.username() ?? "" } : null;
  });

  const logout = useCallback(() => {
    session.clear();
    setUser(null);
  }, []);

  // An expired or rejected token signs the user out, and the protected routes redirect to the login page.
  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  const login = useCallback(async (username, password) => {
    const data = await loginRequest(username, password);
    session.save(data.token, data.username);
    setUser({ username: data.username });
  }, []);

  const value = useMemo(() => ({ user, isAuthenticated: user !== null, login, logout }), [user, login, logout]);

  return <AuthContext value={value}>{children}</AuthContext>;
}
