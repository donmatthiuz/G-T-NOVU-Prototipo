import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next 16.3 activa el CLI experimental por defecto; en Node 26 su salida
  // capturada puede llegar vacía. La API estable de TypeScript conserva el
  // chequeo de tipos y permite builds reproducibles en host y contenedor.
  experimental: {
    useTypeScriptCli: false,
  },
};

export default nextConfig;
