import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    optimizeServerReact: true,
    optimizeCss: true,
  },
  
  // Image optimization
  images: {
    domains: ['localhost', 'vercel.app', 'supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },

  // Compression
  compress: true,

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Performance monitoring
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
};

export default nextConfig;