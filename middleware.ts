import { withAuth } from 'next-auth/middleware'
import { ROLES } from './config/accounts'

const ADMIN_ROUTES = ['/dashboard/settings']

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

export const config = {
  matcher: ['/dashboard/:path*']
}
