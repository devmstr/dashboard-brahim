import * as z from 'zod'

export const userLoginSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Display name must be at least 2 characters long' })
    .max(20, { message: 'Display name must be at most 20 characters long' }),
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
    })
})

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
  name: z
    .string()
    .min(2, { message: 'Display name must be at least 2 characters long' })
    .max(20, { message: 'Display name must be at most 20 characters long' }),
  role: z.string()
})
