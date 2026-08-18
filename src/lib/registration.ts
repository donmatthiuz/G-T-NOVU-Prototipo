import type {
  CaptureKind,
  RegistrationContact,
  RegistrationContactErrors,
} from "@/types/novu";

export const MAX_CAPTURE_BYTES = 10 * 1024 * 1024;

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateCaptureFile(
  file: File,
  kind: CaptureKind,
): string | null {
  const validType =
    IMAGE_TYPES.has(file.type) ||
    (kind === "proof" && file.type === "application/pdf");

  if (!validType) {
    return kind === "proof"
      ? "Usá una imagen JPG, PNG o WebP, o un archivo PDF."
      : "Usá una imagen JPG, PNG o WebP.";
  }

  if (file.size > MAX_CAPTURE_BYTES) {
    return "El archivo debe pesar 10 MB o menos.";
  }

  return null;
}

export function validateRegistrationContact(
  values: RegistrationContact,
): RegistrationContactErrors {
  const errors: RegistrationContactErrors = {};
  const phoneDigits = values.phone.replace(/\D/g, "");

  if (phoneDigits.length !== 8) {
    errors.phone = "Ingresá un teléfono de Guatemala con 8 dígitos.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Ingresá un correo electrónico válido.";
  }

  if (values.password.length < 8) {
    errors.password = "La contraseña debe tener al menos 8 caracteres.";
  }

  if (values.passwordConfirmation !== values.password) {
    errors.passwordConfirmation = "Las contraseñas no coinciden.";
  }

  return errors;
}
