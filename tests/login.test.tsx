import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NovuApp from "@/components/NovuApp";
import { novuApi } from "@/lib/api";
import { readSession } from "@/lib/session";

describe("inicio de sesión con contraseña", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    window.history.replaceState({}, "", "/?page=login");
  });

  it("envía únicamente las credenciales y permite entrar sin documentos", async () => {
    const login = vi.spyOn(novuApi, "login");
    render(<NovuApp exit={vi.fn()} />);

    expect(screen.queryByRole("button", { name: /Huella|Rostro|Face ID|DPI/ })).toBeNull();
    expect(screen.getByLabelText("Correo o teléfono")).toHaveValue("diego@correo.com");
    expect(screen.getByLabelText("Contraseña")).toHaveValue("novu2026");
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeEnabled();
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "" },
    });
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Correo o teléfono"), {
      target: { value: "diego@correo.com" },
    });
    const password = screen.getByLabelText("Contraseña");
    fireEvent.change(password, { target: { value: "novu2026" } });
    fireEvent.submit(password.closest("form")!);

    await waitFor(() => expect(readSession(window.localStorage)).not.toBeNull());
    expect(login).toHaveBeenCalledExactlyOnceWith({
      identifier: "diego@correo.com",
      password: "novu2026",
    });
  });

  it("muestra los errores del servidor y no crea una sesión", async () => {
    vi.spyOn(novuApi, "login").mockRejectedValue(new Error("Credenciales incorrectas."));
    render(<NovuApp exit={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Correo o teléfono"), {
      target: { value: "diego@correo.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "incorrecta" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Credenciales incorrectas.");
    expect(readSession(window.localStorage)).toBeNull();
  });

  it.each(["bio-fingerprint", "bio-face", "bio-faceid"])(
    "abre el login con contraseña desde el enlace anterior %s",
    (page) => {
      window.history.replaceState({}, "", `/?page=${page}`);
      render(<NovuApp exit={vi.fn()} />);
      expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
      expect(screen.queryByText(/verificada|VERIFICACIÓN BIOMÉTRICA/)).toBeNull();
    },
  );

  it("conserva los documentos en el registro", () => {
    window.history.replaceState({}, "", "/?page=kyc");
    render(<NovuApp exit={vi.fn()} />);
    for (const name of ["DPI", "Selfie", "Contacto y contraseña", "Comprobante de domicilio"]) {
      expect(screen.getByRole("button", { name: new RegExp(name) })).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: "Crear mi cuenta y empezar" })).toBeDisabled();
  });
});
