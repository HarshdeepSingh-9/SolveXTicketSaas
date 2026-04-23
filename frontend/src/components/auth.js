const KEY = "ticketing_auth";

export function saveAuth(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function loadAuth() {
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

export function authHeader() {
  const a = loadAuth();
  return a?.token ? { Authorization: `Bearer ${a.token}` } : {};
}