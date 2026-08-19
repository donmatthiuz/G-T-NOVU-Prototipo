import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NovuApp from "@/components/NovuApp";

describe("capacidad de ahorro condicional", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/?page=capacity");
    window.localStorage.clear();
  });

  it("solicita ingreso mensual únicamente para ingresos fijos", () => {
    render(<NovuApp exit={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /Fijos/i }));
    expect(
      screen.getByLabelText(/¿Cuál es tu ingreso mensual neto?/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("¿Cada cuánto recibís ingresos variables?"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Variables/i }));
    expect(
      screen.queryByLabelText(/¿Cuál es tu ingreso mensual neto?/),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("¿Cada cuánto recibís ingresos variables?"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/En un mes bajo, ¿cuánto podrías separar?/),
    ).toBeInTheDocument();
  });

  it("combina ingreso fijo y frecuencia variable cuando corresponde", () => {
    render(<NovuApp exit={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /Ambos/i }));

    expect(
      screen.getByLabelText(/¿Cuál es tu ingreso fijo mensual?/),
    ).toBeInTheDocument();
    expect(screen.getByText("Cada 15 días")).toBeInTheDocument();
    expect(
      screen.getByLabelText(/¿Cuánto podrías ahorrar sin complicarte?/),
    ).toBeInTheDocument();
  });
});
