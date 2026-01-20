import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@guild/api', '@guild/db', '@guild/types'],
  // typedRoutes disabled during active development - re-enable for production
  // typedRoutes: true,
}

export default nextConfig
