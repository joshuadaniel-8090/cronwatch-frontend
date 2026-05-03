/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://cronwatch-backend.onrender.com/:path*',
      },
    ];
  },
};

export default nextConfig;
