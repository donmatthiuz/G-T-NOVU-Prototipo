import type { Metadata } from "next";
import PrototypeShowcase from "@/components/PrototypeShowcase";

export const metadata: Metadata = {
  title: "Prototipo completo — NOVU",
  description:
    "Explorá las 45 pantallas y todos los flujos del prototipo NOVU creado en Figma.",
};

export default function PrototypePage() {
  return <PrototypeShowcase />;
}
