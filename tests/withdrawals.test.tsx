import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NovuApp from "@/components/NovuApp";
import { resetMockApiState } from "@/lib/api";

function open(page: string) {
  window.history.replaceState({}, "", `/?page=${page}`);
  return render(<NovuApp exit={vi.fn()} />);
}

describe("solicitudes del fondo familiar", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    resetMockApiState();
  });

  it("muestra la lista y completa votación y liberación", async () => {
    open("family");
    fireEvent.click(
      await screen.findByRole("button", { name: /Solicitudes del fondo/ }),
    );

    expect(
      await screen.findByRole("heading", {
        name: "Reparación urgente de la tubería de la cocina.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Solicitada por Marta/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Revisar solicitud" }));
    fireEvent.click(await screen.findByRole("button", { name: "Aprobar" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar voto" }));

    expect(
      await screen.findByText("3 de 3 aprobaciones registradas."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Liberar el dinero" }));

    expect(
      await screen.findByRole("heading", { name: "Transferencia confirmada" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Q 4,250")).toBeInTheDocument();
  });

  it("crea una solicitud y la incorpora al listado", async () => {
    open("family-withdraw");
    fireEvent.change(screen.getByLabelText("Monto"), {
      target: { value: "350" },
    });
    fireEvent.change(screen.getByLabelText("Motivo"), {
      target: { value: "Compra de medicamentos" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar solicitud" }));

    expect(
      await screen.findByRole("heading", { name: "Compra de medicamentos" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Pendiente · Q 350")).toBeInTheDocument();
  });
});
