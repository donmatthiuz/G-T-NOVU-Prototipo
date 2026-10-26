import type { Metadata } from "next";
import localFont from "next/font/local";
import "../styles.css";
import "../novu-app.css";
import "../web-shell.css";
import "../mobile-app.css";
import "../copilot-history.css";

const poppins = localFont({
  src: [
    { path: "./fonts/Poppins-Regular.ttf", weight: "400" },
    { path: "./fonts/Poppins-Medium.ttf", weight: "500" },
    { path: "./fonts/Poppins-SemiBold.ttf", weight: "600" },
    { path: "./fonts/Poppins-Bold.ttf", weight: "700" },
    { path: "./fonts/Poppins-ExtraBold.ttf", weight: "800" },
  ],
  variable: "--font-poppins",
  display: "swap",
  preload: false,
});

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
    <html lang="es-GT" className={poppins.variable}>
      <body>{children}</body>
    </html>
  );
}
