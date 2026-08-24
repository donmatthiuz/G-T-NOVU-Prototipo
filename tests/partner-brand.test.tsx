import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PartnerBrand, { NovuSymbol } from "@/components/PartnerBrand";

describe("identidad compartida NOVU y G&T Continental", () => {
  it("presenta el lockup como una sola marca accesible", () => {
    render(<PartnerBrand tone="dark" />);

    const lockup = screen.getByRole("img", {
      name: "NOVU by G&T Continental",
    });

    expect(lockup).toHaveTextContent("NOVUby");
    expect(lockup.querySelectorAll("img")).toHaveLength(2);
    expect(lockup.querySelector("img:last-child")).toHaveAttribute(
      "src",
      expect.stringContaining("/brand/gtc-logo-white.svg"),
    );
  });

  it("permite usar el isotipo de NOVU sin el nombre escrito", () => {
    render(<NovuSymbol decorative={false} />);

    const symbol = screen.getByRole("img", { name: "Símbolo de NOVU" });
    expect(symbol).toHaveAttribute(
      "src",
      expect.stringContaining("novu-mark-transparent.png"),
    );
  });
});
