import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NovuApp from "@/components/NovuApp";
import { resetMockApiState } from "@/lib/api";

function open(page: string) {
  window.history.replaceState({}, "", `/?page=${page}`);
  return render(<NovuApp exit={vi.fn()} />);
}

function submitContribution(amount: string, description: string) {
  fireEvent.change(screen.getByLabelText("Monto"), {
    target: { value: amount },
  });
  fireEvent.change(screen.getByLabelText("Descripción"), {
    target: { value: description },
  });
  fireEvent.click(screen.getByRole("button", { name: "Confirmar aporte" }));
}

describe("aportes persistentes", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    resetMockApiState();
  });

  it("registra un aporte personal y lo muestra en el historial", async () => {
    const view = open("personal-contribute");
    submitContribution("321", "Aporte personal de prueba");

    await screen.findByRole("heading", { name: "Mis metas" });
    view.unmount();
    open("personal-history");

    expect(
      await screen.findByText("Aporte personal de prueba"),
    ).toBeInTheDocument();
    expect(screen.getByText("+ Q 321")).toBeInTheDocument();
  });

  it("registra un aporte al reto y lo muestra en su historial", async () => {
    open("group-contribute");
    submitContribution("321", "Aporte al reto de prueba");

    await screen.findByRole("heading", { name: "Plan del reto" });
    fireEvent.click(screen.getByRole("button", { name: /Historial del reto/ }));

    expect(await screen.findByText("Q 321")).toBeInTheDocument();
  });

  it("registra un aporte al fondo y lo muestra en su historial", async () => {
    open("family-contribute");
    submitContribution("432", "Aporte al fondo de prueba");

    await screen.findByRole("heading", { name: "Fondo familiar" });
    fireEvent.click(
      screen.getByRole("button", { name: /Historial de aportaciones/ }),
    );

    await waitFor(() => expect(screen.getByText("Q 432")).toBeInTheDocument());
  });
});
