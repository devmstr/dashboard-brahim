import { userRoles } from '@/config/global'
import * as z from 'zod'

// Ensure uppercase conversion while preserving tuple type
const USER_ROLE_ARRAY = userRoles.map((role) => role.toUpperCase()) as [
  Uppercase<(typeof userRoles)[number]>
]

export const userSignUpSchema = z.object({
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' }),
  username: z
    .string()
    .min(2, { message: 'Username must be at least 2 characters long' })
    .max(20, { message: 'Username must be at most 20 characters long' }),
  phone: z
    .string()
    .min(9, { message: 'Phone must be at least 8 characters long' })
    .refine((password) => /\d/.test(password), {
      message: 'Only digits allowed'
    }),
  email: z.string().email(),
  employeeId: z.number().positive(),
  role: z.enum(USER_ROLE_ARRAY)
})
export const userLoginSchema = z.object({
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' }),
  input: z
    .string()
    .min(2, { message: 'Input must be at least 2 characters long' })
})

export type UserLoginSchemaType = z.infer<typeof userLoginSchema>
export type UserSignUpSchemaType = z.infer<typeof userSignUpSchema>
