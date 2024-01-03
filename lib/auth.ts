import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { fetcher } from './axios'
import { JWT } from 'next-auth/jwt'

async function refreshToken(token: JWT): Promise<JWT> {
  const res = await fetcher.get<{ backendTokens: any; expiresIn: number }>(
    '/api/auth/refresh',
    {
      headers: {
        Authorization: `Bearer ${token.backendTokens.refreshToken}`
      }
    }
  )

  const response = res.data

  return {
    ...token,
    expiresIn: response.expiresIn,
    backendTokens: response.backendTokens
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    CredentialsProvider({
      name: 'signWithEmailAndPassword',
      credentials: {
        email: {
          label: 'Email',
          type: 'email'
        },
        password: {
          label: 'Password',
          type: 'password'
        },
        keepMeLoggedIn: {
          label: 'Keep me logged in',
          type: 'checkbox'
        }
      },
      async authorize(credentials) {
        const keepMeLoggedIn = Boolean(credentials?.keepMeLoggedIn)

        if (!credentials?.email || !credentials?.password) return null

        try {
          const { email, password } = credentials

          const res = await fetcher.post('/api/auth/login', {
            email,
            password
          })
          if (!res.data) return null
          const user = { ...res.data, keepMeLoggedIn }
          return user
        } catch (error: any) {
          throw new Error(
            JSON.stringify({
              message: error.response.data.message,
              title: error.response.data.error
            })
          )
        }
      }
    })
  ],

  session: {
    // stay for 4 hours
    maxAge: 4 * 60 * 60,
    strategy: 'jwt'
  },

  pages: {
    signIn: '/en/login'
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) return { ...token, ...user }

      if (new Date().getTime() < token.expiresIn) return token

      return await refreshToken(token)
    },

    async session({ token, session }) {
      session.user = token.user
      session.backendTokens = token.backendTokens
      session.expiresIn = token.expiresIn
      session.expires = token.keepMeLoggedIn
        ? new Date(new Date().getTime() + 720 * 3600 * 1000).toISOString() // stay for 30 days
        : new Date(new Date().getTime() + 4 * 3600 * 1000).toISOString() // stay for 1 day

      return session
    },

    async signIn({ user, account, credentials }) {
      const keepMeLoggedIn = Boolean(credentials?.keepMeLoggedIn)

      if (account?.provider === 'credentials') {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const { email, password } = credentials

          const res = await fetcher.post('/api/auth/login', {
            email,
            password
          })
          if (!res.data) return null

          const user = { ...res.data, keepMeLoggedIn }
          return user
        } catch (error: any) {
          throw new Error(
            JSON.stringify({
              message: error.response.data.message,
              title: error.response.data.error
            })
          )
        }
      }

      // Google OAuth login logic
      const { email, image, name: displayName } = user

      try {
        const res = await fetcher.post('/api/auth/o-auth/signin', {
          email,
          image,
          displayName
        })

        if (!res.data) return false

        user.backendTokens = res.data.backendTokens
        user.expiresIn = res.data.expiresIn
        user.user = res.data.user
        user.keepMeLoggedIn = keepMeLoggedIn
        return true
      } catch (error) {
        return false
      }
    }
  }
}
