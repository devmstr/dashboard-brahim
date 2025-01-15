import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from '@/lib/db'
import { User } from 'next-auth'
import { ROLES } from '@/config/accounts'
import { CopyMinus } from 'lucide-react'
import { JWT } from 'next-auth/jwt'
import { UserRole } from '@/types'

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
        /*  
            TODO: add encryption to this function to encrypt the user password this require a decryption function in the reading password process (bcrypt or argon library will be more then enough to fill this need ! )
        */
        if (!credentials) return null
        const { username: input, password } = credentials
        const isEmail = input.includes('@')
        const isEmployeeId = !isNaN(Number(input))

        try {
          const { createdAt, passwordHash, updatedAt, ...user } =
            await prisma.user.findFirstOrThrow({
              where: {
                OR: [
                  { email: isEmail ? input : undefined },
                  { username: !isEmail && !isEmployeeId ? input : undefined },
                  { employeeId: isEmployeeId ? Number(input) : undefined }
                ]
              }
            })
          // TODO: need decryption check here
          if (password !== passwordHash) throw new Error('Wrong Credentials')
          // the use is authorized
          return { ...user, sub: user.id, role: user.role as UserRole }
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
        },
        email: {
          label: 'Email',
          type: 'text',
          placeholder: 'email@example.com'
        },
        employeeId: {
          label: 'EmployeeId',
          type: 'text',
          placeholder: '999'
        }
      },
      async authorize(credentials) {
        if (!credentials) return null
        try {
          const isEmployeeIdExist = await prisma.user.findFirst({
            where: {
              employeeId: !isNaN(Number(credentials?.employeeId))
                ? Number(credentials?.employeeId)
                : undefined
            }
          })

          if (isEmployeeIdExist) throw new Error('This User Already Existe')

          const isUsernameExist = await prisma.user.findFirst({
            where: { username: credentials?.username }
          })

          if (isUsernameExist)
            throw new Error(
              'Sorry! Chose another username cause this username already existe'
            )

          const { passwordHash, createdAt, updatedAt, ...user } =
            await prisma.user.create({
              data: {
                email: credentials?.email || null,
                username: credentials.username,
                employeeId: Number(credentials?.employeeId),
                passwordHash: credentials.password,
                role: credentials.role,
                image: '/images/default-pfp.svg'
              }
            })
          return { ...user, sub: user.id, role: user.role as UserRole }
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
    jwt: async ({ token, user }) => {
      if (user) {
        token.sub = user.sub
        token.role = user.role
        token.username = user.username
        token.employeeId = user.employeeId
      }
      return token
    },
    session: async ({ session, token }) => {
      // cast the token to JWT token
      const userToken = token as JWT

      // Ensure session.user exists
      if (!session.user) session.user = {} as User

      session.user.sub = userToken.sub as string
      session.user.username = userToken.username as string
      session.user.email = userToken.email as string
      session.user.employeeId = userToken.employeeId as number
      session.user.role = userToken.role as UserRole
      session.user.image = userToken.picture || null

      return session
    }
  }
}
