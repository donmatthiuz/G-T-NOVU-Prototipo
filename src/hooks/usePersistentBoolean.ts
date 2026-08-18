"use client";

import { PREFERENCE_CHANGE_EVENT } from "@/lib/session";
import { useCallback, useSyncExternalStore } from "react";

export function usePersistentBoolean(key: string, fallback = false) {
  const subscribe = useCallback(
    (callback: () => void) => {
      const onStorage = (event: StorageEvent) => {
        if (event.key === key) callback();
      };
      const onPreference = (event: Event) => {
        if ((event as CustomEvent<string>).detail === key) callback();
      };
      window.addEventListener("storage", onStorage);
      window.addEventListener(PREFERENCE_CHANGE_EVENT, onPreference);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(PREFERENCE_CHANGE_EVENT, onPreference);
      };
    },
    [key],
  );
  const getSnapshot = useCallback(
    () => window.localStorage.getItem(key),
    [key],
  );
  const stored = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const value = stored === null ? fallback : stored === "true";

  const update = useCallback(
    (next: boolean | ((current: boolean) => boolean)) => {
      const resolved = typeof next === "function" ? next(value) : next;
      window.localStorage.setItem(key, String(resolved));
      window.dispatchEvent(
        new CustomEvent(PREFERENCE_CHANGE_EVENT, { detail: key }),
      );
    },
    [key, value],
  );

  return [value, update] as const;
}
