import { NextResponse } from 'next/server'
import { auth } from '~/lib/auth'

export default auth(req => {
  const { pathname } = req.nextUrl

  // Skip middleware for static files and api routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Extract tenant from subdomain
  const host = req.headers.get('host') ?? ''
  const parts = host.split('.')

  // Development: allow x-tenant-slug header
  let tenantSlug = req.headers.get('x-tenant-slug')

  // Production: extract from subdomain
  if (!tenantSlug && parts.length > 2) {
    tenantSlug = parts[0]
  }

  // Add tenant slug to headers for downstream use
  const response = NextResponse.next()
  if (tenantSlug) {
    response.headers.set('x-tenant-slug', tenantSlug)
  }

  return response
})

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
