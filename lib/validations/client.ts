import * as z from 'zod'

export const clientSchema = z.object({
  isCompany: z.boolean().default(false),
  label: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z
    .string()
    .refine(
      (phone) =>
        /^(?:\+213|0)(5|6|7)\d{8}$/.test(phone) || // algerian phone format
        /^\+?[1-9]\d{1,14}$/.test(phone), // International E.164 format
      {
        message:
          'Invalid phone number. Must be a valid Algerian or international number.'
      }
    )
    .optional(),
  country: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  zip: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code')
    .optional(),
  street: z.string().optional(),
  website: z.string().optional(),
  rc: z.string().optional(),
  mf: z.string().optional(),
  ai: z.string().optional(),
  nif: z.string().optional(),
  nis: z.string().optional(),
  na: z.string().optional()
})

export type ClientType = z.infer<typeof clientSchema>
