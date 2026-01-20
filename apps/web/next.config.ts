import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@guild/api', '@guild/db', '@guild/types'],
  typedRoutes: true,
}

export default nextConfig
