/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://144.91.88.242:3012/:path*', // Proxy to Backend VPS
      },
    ];
  },
};

export default nextConfig;
