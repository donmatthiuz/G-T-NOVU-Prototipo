"use client";

import { novuApi } from "@/lib/api";
import {
  clearSession,
  getAuthSnapshot,
  parseSession,
  subscribeToAuthStorage,
  writeSession,
} from "@/lib/session";
import type {
  AuthSession,
  LoginCredentials,
  RegistrationSubmission,
} from "@/types/novu";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

export function useAuth() {
  const rawSession = useSyncExternalStore(
    subscribeToAuthStorage,
    getAuthSnapshot,
    () => null,
  );
  const session = useMemo(() => parseSession(rawSession), [rawSession]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback((next: AuthSession) => {
    writeSession(window.localStorage, next);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setLoading(true);
      setError(null);
      try {
        const response = await novuApi.login(credentials);
        persist(response.data);
        return true;
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : "No pudimos iniciar sesión.",
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [persist],
  );

  const register = useCallback(
    async (submission: RegistrationSubmission) => {
      setLoading(true);
      setError(null);
      try {
        const response = await novuApi.register(submission);
        persist(response.data);
        return true;
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "No pudimos crear tu cuenta.",
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [persist],
  );

  const logout = useCallback(async () => {
    try {
      await novuApi.logout();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "La sesión local se cerró, pero el servidor no respondió.",
      );
    } finally {
      clearSession(window.localStorage);
    }
  }, []);

  return {
    session,
    authenticated: Boolean(session),
    loading,
    error,
    login,
    register,
    logout,
  };
}
