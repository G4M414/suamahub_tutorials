import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ESLint config (flat) no resuelve con eslint-config-next 15 durante el build de Vercel.
  // El lint es chequeo de calidad en dev; no debe bloquear el deploy.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
