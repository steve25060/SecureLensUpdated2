/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  /**
   * Proxy all /api/* requests to the NestJS backend.
   *
   * In local dev the backend runs on http://localhost:4000.
   * In Docker Compose the backend is reachable via http://backend:4000.
   *
   * Set NEXT_PUBLIC_BACKEND_URL in your .env to override the default.
   */
  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'http://backend:4000'
        : 'http://localhost:4000');

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
