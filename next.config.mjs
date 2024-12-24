/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['pino', 'pino-pretty'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '139.224.248.149',
        port: '9000',
        pathname: '/jade-docs/**',
      },
    ],
  },
};

export default nextConfig;
