import * as z from 'zod'

// Address schema for nested validation
export const addressSchema = z.object({
  id: z.string().optional(),
  street: z.string().nullable().optional(),
  cityId: z.string(),
  provinceId: z.string(),
  countryId: z.string()
})

// Client schema matching the Prisma model
export const newClientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  phone: z.string().optional(),
  label: z.string().nullable().optional(),
  email: z
    .string()
    .email({ message: 'Invalid email address' })
    .nullable()
    .optional(),
  isCompany: z.boolean().default(false),
  website: z
    .string()
    .url({ message: 'Invalid website URL' })
    .nullable()
    .optional(),
  tradeRegisterNumber: z.string().nullable().optional(),
  fiscalNumber: z.string().nullable().optional(),
  registrationArticle: z.string().nullable().optional(),
  taxIdNumber: z.string().nullable().optional(),
  statisticalIdNumber: z.string().nullable().optional(),
  approvalNumber: z.string().nullable().optional(),

  // Address fields
  addressId: z.string().nullable().optional(),
  street: z.string().nullable().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
  zip: z.string().optional()
})

export type NewClient = z.infer<typeof newClientSchema>
