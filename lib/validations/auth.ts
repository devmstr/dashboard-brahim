import * as z from 'zod'

export const userLoginSchema = z.object({
  input: z.string(),
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
export type UserLoginSchemaType = z.infer<typeof userLoginSchema>

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
    .min(2, { message: 'username must be at least 2 characters long' })
    .max(20, { message: 'username must be at most 20 characters long' }),
  email: z.string().email().optional(),
  employeeId: z.number().positive(),
  role: z.string()
})

export type UserSignUpSchemaType = z.infer<typeof userSignUpSchema>
