import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from '@/lib/db'
import { User } from 'next-auth'
import { ROLES } from '@/config/accounts'
import { CopyMinus } from 'lucide-react'
import { JWT } from 'next-auth/jwt'

export const authOptions: AuthOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      id: 'singIn',
      name: 'singIn',
      credentials: {
        username: {
          label: 'Username',
          type: 'text',
          placeholder: 'Username...'
        },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: '********'
        }
      },
      async authorize(credentials, req) {
        if (!credentials) return null
        try {
          const { createdAt, password, updatedAt, ...user } =
            await prisma.user.findUniqueOrThrow({
              where: { name: credentials?.username }
            })

          if (
            credentials.password === password &&
            credentials.username === user.name
          )
            return { sub: user.id, ...user }
          else throw new Error('Wrong Credentials')
        } catch (error) {
          console.log(error)
          return null
        }
      }
    }),
    CredentialsProvider({
      id: 'register',
      name: 'register',
      credentials: {
        username: {
          label: 'Username',
          type: 'text',
          placeholder: 'Username'
        },
        password: { label: 'Password', type: 'password' },
        role: {
          label: 'Role',
          type: 'text'
        }
      },
      async authorize(credentials) {
        if (!credentials) return null
        try {
          const isExiste = await prisma.user.findUnique({
            where: { name: credentials?.username }
          })
          if (isExiste) throw new Error('This User Already Existe')
          const { password, createdAt, updatedAt, ...user } =
            await prisma.user.create({
              data: {
                name: credentials.username,
                password: credentials.password,
                role: credentials.role
              }
            })
          return user
        } catch (error) {
          console.log(error)
          return null
        }
      }
    })
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    secret: process.env.NEXTAUTH_SECRET
  },
  session: {
    maxAge: 60 * 60 * 24 * 30,
    strategy: 'jwt'
  },
  pages: {
    signIn: '/',
    signOut: '/'
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role
        token.picture = user.image
      }
      return token
    },
    async session({ session, user, token }) {
      if (token && session.user) session.user.role = token.role
      return session
    }
  }
}
