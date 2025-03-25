import { userRoles } from '@/config/global'
import * as z from 'zod'

// Ensure uppercase conversion while preserving tuple type
const USER_ROLE_ARRAY = userRoles.map((role) => role.toUpperCase()) as [
  Uppercase<(typeof userRoles)[number]>
]

export const userSignUpSchema = z.object({
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .refine((password) => /[a-z]/.test(password), {
      message: 'Password must contain at least one lowercase letter'
    })
    .refine((password) => /[A-Z]/.test(password), {
      message: 'Password must contain at least one uppercase letter'
    })
    .refine((password) => /\d/.test(password), {
      message: 'Password must contain at least one digit'
    }),
  username: z
    .string()
    .min(2, { message: 'Username must be at least 2 characters long' })
    .max(20, { message: 'Username must be at most 20 characters long' }),
  email: z.string().email(),
  employeeId: z.number().positive(),
  role: z.enum(USER_ROLE_ARRAY)
})
export const userLoginSchema = z.object({
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .refine((password) => /[a-z]/.test(password), {
      message: 'Password must contain at least one lowercase letter'
    })
    .refine((password) => /[A-Z]/.test(password), {
      message: 'Password must contain at least one uppercase letter'
    })
    .refine((password) => /\d/.test(password), {
      message: 'Password must contain at least one digit'
    }),
  input: z.string()
})

export type UserLoginSchemaType = z.infer<typeof userLoginSchema>
export type UserSignUpSchemaType = z.infer<typeof userSignUpSchema>
