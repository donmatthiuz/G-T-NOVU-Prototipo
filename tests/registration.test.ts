import { describe, expect, it } from "vitest";
import {
  MAX_CAPTURE_BYTES,
  validateCaptureFile,
  validateRegistrationContact,
} from "@/lib/registration";

describe("registro local", () => {
  it("acepta imágenes para identidad y PDF únicamente para comprobantes", () => {
    const image = new File(["image"], "dpi.jpg", { type: "image/jpeg" });
    const pdf = new File(["pdf"], "recibo.pdf", { type: "application/pdf" });

    expect(validateCaptureFile(image, "dpi")).toBeNull();
    expect(validateCaptureFile(pdf, "proof")).toBeNull();
    expect(validateCaptureFile(pdf, "selfie")).toContain("imagen");
  });

  it("rechaza archivos mayores a 10 MB", () => {
    const oversized = new File(
      [new Uint8Array(MAX_CAPTURE_BYTES + 1)],
      "dpi.png",
      {
        type: "image/png",
      },
    );

    expect(validateCaptureFile(oversized, "dpi")).toContain("10 MB");
  });

  it("valida teléfono, correo y confirmación de contraseña", () => {
    expect(
      validateRegistrationContact({
        phone: "123",
        email: "correo-invalido",
        password: "corta",
        passwordConfirmation: "distinta",
      }),
    ).toEqual({
      phone: expect.any(String),
      email: expect.any(String),
      password: expect.any(String),
      passwordConfirmation: expect.any(String),
    });

    expect(
      validateRegistrationContact({
        phone: "5512 3456",
        email: "persona@correo.com",
        password: "novu2026",
        passwordConfirmation: "novu2026",
      }),
    ).toEqual({});
  });
});
