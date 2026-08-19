import type { Metadata } from "next";
import "../styles.css";
import "../novu-app.css";
import "../web-shell.css";

export const metadata: Metadata = {
  title: "NOVU — Tu futuro empieza con un paso",
  description: "Prototipo frontend del copiloto de ahorro NOVU.",
  icons: {
    icon: "/brand/novu-mark-transparent.png",
    shortcut: "/brand/novu-mark-transparent.png",
    apple: "/brand/novu-mark-transparent.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-GT">
      <body>{children}</body>
    </html>
  );
}
