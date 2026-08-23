import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PrototypeShowcase from "@/components/PrototypeShowcase";

describe("navegación de prototipos móviles", () => {
  it("cambia entre los cinco grupos y abre su primera pantalla", () => {
    render(<PrototypeShowcase />);

    const navigation = screen.getByRole("navigation", {
      name: "Cambiar grupo de prototipos móviles",
    });
    const login = within(navigation).getByRole("button", {
      name: "Inicio de sesión: 4 pantallas",
    });
    const registration = within(navigation).getByRole("button", {
      name: "Registro: 17 pantallas",
    });
    const groupFund = within(navigation).getByRole("button", {
      name: "Fondo grupal: 11 pantallas",
    });

    expect(within(navigation).getAllByRole("button")).toHaveLength(5);
    expect(registration).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(login);
    expect(login).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByAltText("Pantalla 01a · Inicio de sesión del prototipo NOVU"),
    ).toBeInTheDocument();

    fireEvent.click(groupFund);
    expect(groupFund).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByAltText(
        "Pantalla 21 · Crear fondo familiar del prototipo NOVU",
      ),
    ).toBeInTheDocument();
  });
});
