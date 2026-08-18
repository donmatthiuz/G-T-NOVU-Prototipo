import { describe, expect, it } from "vitest";
import { mockTransport, novuApi } from "@/lib/api";

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
      mockTransport.request({ method: "POST", path: "/v1/login" }),
    ).rejects.toMatchObject({
      status: 501,
    });
  });
});
