import { withAuth } from 'next-auth/middleware'
import { UserRole } from './types'

// Define protected routes and their required roles
export const ROUTE_ROLE_MAP: { [route: string]: UserRole[] } = {
  '/dashboard/settings': ['ADMIN'],
  '/dashboard/pricing': ['ADMIN', 'SALES_MANAGER'],
  '/dashboard/ledger': [
    'ADMIN',
    'FINANCE',
    'FINANCE_MANAGER',
    'SALES_MANAGER',
    'SALES_AGENT'
  ],
  '/dashboard/printing': ['ADMIN', 'SALES_MANAGER', 'SALES_AGENT'],
  '/dashboard/cars': [
    'ADMIN',
    'CONSULTANT',
    'ENGINEERING_MANAGER',
    'PRODUCTION_MANAGER'
  ],
  '/dashboard/new': ['ADMIN', 'SALES_AGENT'],
  '/dashboard/pos': ['ADMIN', 'SALES_AGENT'],
  '/dashboard/db': [
    'ADMIN',
    'ENGINEER',
    'ENGINEERING_MANAGER',
    'CONSULTANT',
    'DATA_AGENT'
  ],
  '/dashboard/orders': [
    'ADMIN',
    'DATA_AGENT',
    'SALES_AGENT',
    'CONSULTANT',
    'ENGINEER',
    'ENGINEERING_MANAGER',
    'PRODUCTION_MANAGER'
  ],
  '/dashboard/inventory': [
    'ADMIN',
    'SALES_AGENT',
    'SALES_MANAGER',
    'INVENTORY_AGENT'
  ],
  '/dashboard/client': [
    'ADMIN',
    'SALES_AGENT',
    'SALES_MANAGER',
    'FINANCE',
    'FINANCE_MANAGER'
  ],
  '/dashboard/timeline': [
    'ADMIN',
    'PRODUCTION_MANAGER'
    // 'SALES_AGENT'
    // 'ENGINEER',
    // 'CONSULTANT'
  ],
  '/dashboard/audit-logs': ['ADMIN'],
  '/dashboard/procurement/contracts': ['FINANCE', 'FINANCE_MANAGER'],
  '/dashboard/procurement': ['PROCRUTEMENT_AGENT', 'PROCRUTEMENT_MANAGER']

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
