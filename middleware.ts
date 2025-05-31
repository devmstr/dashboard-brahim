import { withAuth } from 'next-auth/middleware'
import { ROLES } from './config/accounts'
import { UserRole } from './types'

// Define protected routes and their required roles
export const ROUTE_ROLE_MAP: { [route: string]: UserRole[] } = {
  '/dashboard/settings': ['ADMIN'],
  '/dashboard/ledger': ['ADMIN', 'ACCOUNTANT', 'SALES_MANAGER', 'SALES_AGENT'],
  '/dashboard/cars': ['ADMIN', 'CONSULTANT'],
  '/dashboard/new': ['ADMIN', 'SALES_AGENT', 'SALES_MANAGER'],
  '/dashboard/pos': ['ADMIN', 'SALES_AGENT', 'SALES_MANAGER'],
  '/dashboard/orders': ['ADMIN', 'SALES_AGENT', 'SALES_MANAGER'],
  '/dashboard/inventory': ['ADMIN', 'SALES_AGENT', 'SALES_MANAGER'],
  '/dashboard/client': ['ADMIN', 'SALES_AGENT', 'SALES_MANAGER'],
  '/dashboard/db': ['ADMIN', 'ENGINEER', 'ENGINEERING_MANAGER', 'CONSULTANT'],
  '/dashboard/timeline': [
    'ADMIN',
    'ENGINEER',
    'ENGINEERING_MANAGER',
    'CONSULTANT'
  ]
  // Add more routes and roles as needed
}

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const pathname = req.nextUrl.pathname
      for (const route in ROUTE_ROLE_MAP) {
        if (pathname.startsWith(route)) {
          // Only allow if the user's role is in the allowed roles for this route
          if (!token || typeof token.role !== 'string') return false
          return ROUTE_ROLE_MAP[route].includes(token.role)
        }
      }
      // Default: allow if authenticated
      return !!token
    }
  }
})

export const config = {
  matcher: ['/dashboard/:path*']
}
