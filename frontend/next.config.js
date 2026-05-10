/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
  rewrites: async () => {
    // NEXT_PUBLIC_BACKEND_URL is set in Vercel env vars
    // e.g. https://loggpt-backend.onrender.com
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: `${backendUrl}/:path*`,
        },
      ],
    };
  },
};

module.exports = nextConfig;