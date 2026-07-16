const AUTH_BASE = 'https://28538-authfake.adobeio-static.net/api/v1/web/FakeAuth';

/**
 * Authenticate with identifier + password.
 * On success, persists the response (including token) to localStorage.
 * @returns {Object|null} user info object, or null on failure
 */
export async function authenticate(identifier, password) {
  try {
    const resp = await fetch(`${AUTH_BASE}/generic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    localStorage.setItem('auth', JSON.stringify(data));
    return data;
  } catch {
    return null;
  }
}

/**
 * Validate the stored token against the verify endpoint.
 * Clears localStorage if the token is no longer valid.
 * @returns {Object|null} user info object, or null if invalid/absent
 */
export async function validateAuth() {
  try {
    const stored = localStorage.getItem('auth');
    if (!stored) return null;
    const { token } = JSON.parse(stored);
    if (!token) return null;
    const resp = await fetch(`${AUTH_BASE}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!resp.ok) {
      localStorage.removeItem('auth');
      return null;
    }
    return await resp.json();
  } catch {
    return null;
  }
}

/**
 * Returns true if a stored auth token exists (optimistic — does not re-verify).
 */
export function isAuthenticated() {
  try {
    return localStorage.getItem('auth') !== null;
  } catch {
    return false;
  }
}

/**
 * Remove stored auth data (sign out).
 */
export function clearAuth() {
  try { localStorage.removeItem('auth'); } catch { /* noop */ }
}
