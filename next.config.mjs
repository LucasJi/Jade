/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['pino', 'pino-pretty'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/obj/**',
      },
      {
        protocol: 'https',
        hostname: 'jade.lucasji.cn',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
