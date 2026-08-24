import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LandingPage from "@/components/LandingPage";
import TechnologyPage from "@/app/tecnologia/page";

describe("página de arquitectura técnica", () => {
  it("se abre desde el botón al final de la landing", () => {
    render(<LandingPage />);

    expect(
      screen.getByRole("link", { name: /ver arquitectura técnica/i }),
    ).toHaveAttribute("href", "/tecnologia");
  });

  it("explica las fuentes, los agentes y los límites de la integración", () => {
    render(<TechnologyPage />);

    expect(
      screen.getByRole("heading", {
        name: /inteligencia útil, conectada de forma controlada/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/réplicas transaccionales/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/catálogo de productos/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", {
        name: "Agente de comportamiento financiero",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/el modelo no se conecta directamente/i),
    ).toBeInTheDocument();
  });
});
