/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3000/:path*', // was 5000, backend uses 3000
        },
      ],
    }
  },
}

module.exports = nextConfig