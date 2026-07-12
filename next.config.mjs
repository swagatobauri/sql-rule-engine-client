import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Resolve the "@/..." alias via an explicit webpack alias. The tsconfig
  // "paths" plugin fails to resolve certain paths in this setup, so we map
  // "@" -> project root directly to keep imports working everywhere.
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": __dirname,
    };
    return config;
  },
};

export default nextConfig;
