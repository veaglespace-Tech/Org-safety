import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['195.35.21.96'],
  reactCompiler: true,
  experimental: {
    turbopack: {
      root: __dirname,
    },
  },
};

export default nextConfig;