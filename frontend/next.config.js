/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
  rewrites: async () => {
    // Support both deployment env names so uploads keep working in production.
    const backendUrl = [process.env.NEXT_PUBLIC_BACKEND_URL, process.env.NEXT_PUBLIC_API_URL, "http://localhost:5000"]
      .map((value) => (typeof value === "string" ? value.trim().replace(/\/+$/, "") : value))
      .find(Boolean);

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