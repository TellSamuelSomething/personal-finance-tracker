const BASE_URL = import.meta.env.VITE_API_URL ?? "";
const TOKEN_KEY = "token";
const USERNAME_KEY = "username";

// localStorage can be unavailable (private mode), the app then keeps working until the page reloads.
function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export const session = {
  token: () => read(TOKEN_KEY),
  username: () => read(USERNAME_KEY),
  save(token, username) {
    write(TOKEN_KEY, token);
    write(USERNAME_KEY, username);
  },
  clear() {
    write(TOKEN_KEY, null);
    write(USERNAME_KEY, null);
  },
};

let onUnauthorized = () => {};

/** Called when the server rejects the saved token, so the app can send the user to the login page. */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors ?? {};
  }
}

export async function apiFetch(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = session.token();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(BASE_URL + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Could not reach the server. Is it running?", 0);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && auth) onUnauthorized();
    throw new ApiError(data?.message ?? "Something went wrong", response.status, data?.errors);
  }

  return data;
}
