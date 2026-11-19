import type { NextConfig } from "next";

// Hostinger runs the headless frontend as a Node.js app (`next start`),
// so this stays a server build: no `output: "export"`.
const nextConfig: NextConfig = {
  poweredByHeader: false,
};

export default nextConfig;
