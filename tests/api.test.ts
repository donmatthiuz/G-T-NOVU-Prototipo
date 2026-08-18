import { describe, expect, it } from "vitest";
import { createRegistrationFormData, mockTransport, novuApi } from "@/lib/api";

describe("capa API local", () => {
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
      media: {
        selfie: new File(["image"], "selfie.jpg", { type: "image/jpeg" }),
      },
    });

    expect(session.data.accessToken).toMatch(/^demo-/);
    expect(form.get("contact")).toContain("persona@correo.com");
    expect(form.get("selfie")).toBeInstanceOf(File);
  });
});
