/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  // Rewrites to handle authentication before accessing /errorCode folder
  async rewrites() {
    return [
      {
        source: '/errorCode/:path*', // Protect the /errorCode folder
        destination: '/api/checkAuth', // Route requests to the API that checks authentication
      },
    ];
  },
};

module.exports = nextConfig;
