import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useNovuData } from "@/hooks/useNovuData";

describe("useNovuData", () => {
  it("entrega el snapshot local y completa la carga mediante el contrato API", async () => {
    const { result } = renderHook(() => useNovuData());

    expect(result.current.data.personalGoal.name).toBe("Viaje a Antigua");
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.data.recentActivity).toHaveLength(3);
  });
});
