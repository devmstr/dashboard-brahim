import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from '@/lib/db'
import { User } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import { UserRole } from '@/types'
import { userLoginSchema } from './validations'

export const authOptions: AuthOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      id: 'singIn',
      name: 'singIn',
      credentials: {
        input: {
          label: "Nom d'utilisateur /Phone / Email / ID Employé",
          type: 'text',
          placeholder: '...'
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
        const validationFields = userLoginSchema.safeParse(credentials)

        if (!validationFields.success) {
          console.log(validationFields.error)
          return null
        }
        const { input, password } = validationFields.data

        const isEmail = input.includes('@')
        const isNumber = /^\d+$/.test(input)

        const isPhoneNumber =
          isNumber && input.length >= 8 && input.length <= 15
        const isEmployeeId = isNumber && input.length <= 5

        try {
          const user = await prisma.user.findFirstOrThrow({
            where: {
              OR: [
                { email: isEmail ? input : undefined },
                { username: !isEmail && !isNumber ? input : undefined },
                { employeeId: isEmployeeId ? Number(input) : undefined },
                { phone: isPhoneNumber ? input : undefined }
              ]
            }
          })
          // TODO: need decryption check here
          if (password !== user.passwordHash) {
            console.log('Invalid password')
            return null
          }

          // the use is authorized
          return {
            id: user.id,
            sub: user.id,
            email: user.email,
            username: user.username as string,
            role: user.role as UserRole,
            employeeId: user.employeeId,
            image: user.image,
            phone: user.phone
          }
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
