import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dev-moove-wp.pantheonsite.io",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/moove/backend/wp-content/uploads/**",
      },
      {
        protocol: "http",
        hostname: "moove-homolog.local",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "s3.us-east-1.amazonaws.com",
        pathname: "/cdn.inforlube.com/Images/**",
      },
      {
        protocol: 'https',
        hostname: 'dev-moove-wp.pantheonsite.io',
        pathname: '/wp-content/**',
      },
    ],
  },
  async rewrites() {
    return [
      { source: "/produtos/:path*", destination: "/products/:path*" },
      { source: "/segmentos/:path*", destination: "/segments/:path*" },
      { source: "/industria/:path*", destination: "/industry/:path*" },
      { source: "/conteudos/:path*", destination: "/content/:path*" },
      { source: "/blog/:path*", destination: "/blog/:path*" },
    ];
  },
  async redirects() {
    return [
      {
        source: "/segmento/:slug",
        destination: "/segmentos/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;