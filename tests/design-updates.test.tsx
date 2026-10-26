import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LandingPage from "@/components/LandingPage";
import NovuApp from "@/components/NovuApp";
import ChatbotArchitecture from "@/components/ChatbotArchitecture";

describe("cambios de presentación y experiencia móvil", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("conserva el mensaje de referencia y abre la versión funcional desde la portada", () => {
    render(<LandingPage />);
    expect(
      screen.getByRole("heading", { name: "Tu futuro empieza con un paso." }),
    ).toBeInTheDocument();
    const header = screen.getByRole("banner");
    expect(
      within(header).queryByRole("link", {
        name: /prototipo completo|diseño app móvil/i,
      }),
    ).toBeNull();
    expect(screen.getByAltText("Portada del prototipo NOVU")).toHaveAttribute(
      "src",
      expect.stringContaining("63-432.png"),
    );
    fireEvent.click(
      within(header).getByRole("button", { name: "Probar versión funcional" }),
    );
    expect(
      screen.getByRole("button", { name: "Ya tengo cuenta" }),
    ).toBeInTheDocument();
  });

  it("usa las mismas pantallas al navegar por la barra móvil", () => {
    window.history.replaceState({}, "", "/?page=home");
    render(<NovuApp exit={vi.fn()} />);
    const nav = screen.getByRole("navigation", { name: "Navegación móvil" });
    expect(within(nav).getAllByRole("button")).toHaveLength(5);
    expect(
      within(nav).getByRole("button", { name: "Inicio", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    fireEvent.click(
      within(nav).getByRole("button", { name: "Metas", exact: true }),
    );
    expect(
      screen.getByRole("heading", { name: "Mis metas" }),
    ).toBeInTheDocument();
    expect(
      within(nav).getByRole("button", { name: "Metas", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    fireEvent.click(
      within(nav).getByRole("button", { name: "Menú", exact: true }),
    );
    fireEvent.click(
      within(screen.getByRole("main")).getByRole("button", {
        name: /Fondo familiar/,
      }),
    );
    expect(
      screen.getByRole("heading", { name: "Fondo familiar" }),
    ).toBeInTheDocument();
    expect(
      within(nav).getByRole("button", { name: "Metas", exact: true }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("reserva la barra móvil para las pantallas principales y conserva el acceso por contraseña", () => {
    window.history.replaceState({}, "", "/?page=login");
    render(<NovuApp exit={vi.fn()} />);
    expect(
      screen.queryByRole("navigation", { name: "Navegación móvil" }),
    ).toBeNull();
    expect(screen.getByLabelText("Contraseña")).toHaveValue("novu2026");
    expect(screen.queryByRole("button", { name: /Face ID|Huella/ })).toBeNull();
  });

  it("explica cómo JEV separa la parte atendible de una solicitud", () => {
    render(<ChatbotArchitecture />);
    fireEvent.click(
      screen.getByRole("button", { name: "Solicitud parcial", exact: true }),
    );
    expect(
      screen.getByRole("button", { name: "Solicitud parcial", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByText(
        "Puedo ayudarte a revisar tu ahorro para el viaje. La compra del boleto se realiza fuera de NOVU.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Obtener datos" }),
    ).toBeInTheDocument();
  });

  it("termina las consultas fuera de alcance sin pasar por datos ni por el LLM", () => {
    render(<ChatbotArchitecture />);
    fireEvent.click(
      screen.getByRole("button", { name: "Fuera de alcance", exact: true }),
    );
    expect(screen.queryByRole("heading", { name: "Obtener datos" })).toBeNull();
    expect(
      screen.queryByRole("heading", { name: "Explicar con contexto" }),
    ).toBeNull();
    expect(
      screen.getByText(
        "Puedo ayudarte con tus metas, tu ahorro y tus planes compartidos. Esa consulta está fuera del alcance de NOVU.",
      ),
    ).toBeInTheDocument();
  });
});
