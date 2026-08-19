import { describe, expect, it } from "vitest";
import {
  createFetchTransport,
  createNovuApi,
  createRegistrationFormData,
  mockTransport,
  novuApi,
} from "@/lib/api";
import { afterEach, vi } from "vitest";

describe("capa API local", () => {
  afterEach(() => vi.restoreAllMocks());
  it("devuelve el resumen tipado sin compartir referencias mutables", async () => {
    const first = await novuApi.getOverview();
    const second = await novuApi.getOverview();

    expect(first.status).toBe(200);
    expect(first.data.profile.firstName).toBe("Diego");
    expect(first.data.personalGoal.progress).toBe(62);
    expect(first.data).not.toBe(second.data);
  });

  it("falla explícitamente para contratos todavía no implementados", async () => {
    await expect(
      mockTransport.request({ method: "POST", path: "/v1/unknown" }),
    ).rejects.toMatchObject({
      status: 501,
    });
  });

  it("expone contratos de autenticación y un registro multipart", async () => {
    const session = await novuApi.login({
      identifier: "diego@correo.com",
      password: "novu2026",
    });
    const form = createRegistrationFormData({
      contact: {
        phone: "5512 3456",
        email: "persona@correo.com",
        password: "novu2026",
        passwordConfirmation: "novu2026",
      },
      savingsCapacity: {
        incomePattern: "variable",
        variableIncomeFrequency: "irregular",
        safeMonthlySavingsMinor: 25000,
      },
      media: {
        selfie: new File(["image"], "selfie.jpg", { type: "image/jpeg" }),
      },
    });

    expect(session.data.accessToken).toMatch(/^demo-/);
    expect(form.get("contact")).toContain("persona@correo.com");
    expect(form.get("savings_capacity")).toContain('"incomePattern":"variable"');
    expect(form.get("selfie")).toBeInstanceOf(File);
  });

  it("envía sesión y mensajes del Copiloto al backend HTTP", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          userMessage: { id: "u1", sender: "user", content: "¿Cómo voy?" },
          assistantMessage: {
            id: "a1",
            sender: "assistant",
            content: "Vas en 62%.",
          },
          duplicated: false,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    const api = createNovuApi(
      createFetchTransport({
        baseUrl: "http://api.test/",
        getAccessToken: () => "session-token",
      }),
    );

    await api.sendCopilotMessage("conversation-1", "¿Cómo voy?", "client-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/v1/copilot/conversations/conversation-1/messages",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer session-token",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          content: "¿Cómo voy?",
          clientMessageId: "client-1",
        }),
      }),
    );
  });
});
