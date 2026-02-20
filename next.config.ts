import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Skip ESLint during builds — the project has CRLF line endings (Windows)
    // which cause hundreds of prettier format errors on Linux (Vercel).
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
