import type { Session } from "next-auth";

const SESSION_KEY = "wildtrack-session";

export function cacheSession(session: Session): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    return;
  }
}

export function getCachedSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    if (new Date(session.expires) < new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearCachedSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    return;
  }
}
