import path from 'path';
import { fileURLToPath } from 'url';
import withPWAInit from '@ducanh2912/next-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['tichisuraksha.veaglespace.com'],
  reactCompiler: true,
  turbopack: {},
};

export default withPWA(nextConfig);