import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useAuth } from "@/hooks/useAuth";
import {
  AUTH_STORAGE_KEY,
  SIDEBAR_STORAGE_KEY,
  readBooleanPreference,
  readSession,
} from "@/lib/session";

describe("sesión y preferencias locales", () => {
  beforeEach(() => window.localStorage.clear());

  it("persiste el login y elimina la sesión al salir", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      expect(
        await result.current.login({
          identifier: "diego@correo.com",
          password: "novu2026",
        }),
      ).toBe(true);
    });

    expect(readSession(window.localStorage)?.user.firstName).toBe("Diego");
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeTruthy();

    await act(async () => result.current.logout());
    expect(readSession(window.localStorage)).toBeNull();
  });

  it("descarta sesiones vencidas y lee la preferencia del sidebar", () => {
    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        accessToken: "expired",
        expiresAt: "2020-01-01T00:00:00.000Z",
        user: { id: "1" },
      }),
    );
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, "true");

    expect(readSession(window.localStorage)).toBeNull();
    expect(
      readBooleanPreference(window.localStorage, SIDEBAR_STORAGE_KEY),
    ).toBe(true);
  });
});
