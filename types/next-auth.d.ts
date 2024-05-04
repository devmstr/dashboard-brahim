import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    sub: string
    name: string
    role?: UserRole
    image: string | null
  }

  interface Session extends DefaultSession {
    user?: User
  }
}

import { JWT } from 'next-auth/jwt'
import { UserRole } from '.'

declare module 'next-auth/jwt' {
  interface JWT {
    role?: UserRole
  }
}
