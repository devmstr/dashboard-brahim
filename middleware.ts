import { withAuth } from 'next-auth/middleware'
import { ROLES } from './config/accounts'

export default withAuth({
  callbacks: {
    authorized: async ({ req, token }) => {
      if (req.nextUrl.pathname.startsWith('/admin'))
        return token?.role === ROLES.ADMIN
      return !!token
    }
  }
})

export const config = {
  matcher: ['/dashboard/:path*', '/dashboard/admin:path*']
}
