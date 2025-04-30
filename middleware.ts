import { withAuth } from 'next-auth/middleware'
import { ROLES } from './config/accounts'

const ADMIN_ROUTES = ['/dashboard/settings']

// Only use middleware for authentication, not for file caching
export default withAuth({
  callbacks: {
    authorized: async ({ req, token }) => {
      const pathname = req.nextUrl.pathname

      if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
        return (
          token?.role === ROLES.find(({ value }) => value === 'ADMIN')?.value
        )
      }

      return !!token
    }
  }
})

// Only match dashboard routes, not upload routes
export const config = {
  matcher: ['/dashboard/:path*']
}
