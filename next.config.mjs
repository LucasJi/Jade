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
  // react-pdf
  experimental: {
    turbo: {
      resolveAlias: {
        /**
         * Critical: prevents " ⨯ ./node_modules/canvas/build/Release/canvas.node
         * Module parse failed: Unexpected character '�' (1:0)" error
         */
        canvas: './empty-module.ts',
      },
    },
  },
};

export default nextConfig;
