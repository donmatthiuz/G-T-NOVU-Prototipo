import type { AuthSession } from "@/types/novu";

export const AUTH_STORAGE_KEY = "novu.auth.session.v1";
export const SIDEBAR_STORAGE_KEY = "novu.ui.sidebar-collapsed.v1";
export const AUTH_CHANGE_EVENT = "novu:auth-change";
export const PREFERENCE_CHANGE_EVENT = "novu:preference-change";

export function parseSession(raw: string | null): AuthSession | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<AuthSession>;
    if (
      !value.accessToken ||
      !value.expiresAt ||
      !value.user?.id ||
      Date.parse(value.expiresAt) <= Date.now()
    ) {
      return null;
    }
    return value as AuthSession;
  } catch {
    return null;
  }
}

export function readSession(storage: Storage): AuthSession | null {
  try {
    const value = parseSession(storage.getItem(AUTH_STORAGE_KEY));
    if (!value) {
      storage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return value;
  } catch {
    storage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function writeSession(storage: Storage, session: AuthSession): void {
  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearSession(storage: Storage): void {
  storage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function getAuthSnapshot(): string | null {
  return window.localStorage.getItem(AUTH_STORAGE_KEY);
}

export function subscribeToAuthStorage(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === AUTH_STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
  };
}

export function readBooleanPreference(
  storage: Storage,
  key: string,
  fallback = false,
): boolean {
  const value = storage.getItem(key);
  return value === null ? fallback : value === "true";
}
