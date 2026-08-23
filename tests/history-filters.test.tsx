import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NovuApp from "@/components/NovuApp";
import { resetMockApiState } from "@/lib/api";

describe("filtros de historiales", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    resetMockApiState();
  });

  it("abre el historial personal y separa aportes de gastos", async () => {
    window.history.replaceState({}, "", "/?page=personal-history");
    render(<NovuApp exit={vi.fn()} />);

    await screen.findByRole("heading", { name: "Historial personal" });
    expect(screen.getByText("Aporte semanal")).toBeInTheDocument();
    expect(screen.getByText("Café con amigos")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Gastos" }));
    expect(screen.getByText("Café con amigos")).toBeInTheDocument();
    expect(screen.queryAllByText("Aporte semanal")).toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: "Aportes" }));
    expect(screen.getByText("Aporte semanal")).toBeInTheDocument();
    expect(screen.queryByText("Café con amigos")).not.toBeInTheDocument();
  });

  it("filtra el historial del reto por período e integrante", async () => {
    window.history.replaceState({}, "", "/?page=group-history");
    render(<NovuApp exit={vi.fn()} />);

    await screen.findByText("14 ago");
    expect(screen.queryByText("28 jul")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Todos" }));
    expect(screen.getByText("28 jul")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Por miembro" }));
    fireEvent.click(screen.getByRole("button", { name: "Carlos" }));
    expect(screen.getByText("Q 120")).toBeInTheDocument();
    expect(screen.queryByText("Q 125")).not.toBeInTheDocument();
  });

  it("filtra el historial del fondo por integrante", async () => {
    window.history.replaceState({}, "", "/?page=family-history");
    render(<NovuApp exit={vi.fn()} />);

    await screen.findByText("10 ago");
    fireEvent.click(screen.getByRole("button", { name: "Por miembro" }));
    fireEvent.click(screen.getByRole("button", { name: "Elena" }));

    expect(screen.getByText("10 ago")).toBeInTheDocument();
    expect(screen.queryByText("13 ago")).not.toBeInTheDocument();
  });
});
