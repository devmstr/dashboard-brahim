import { COMPANY_LABELS_TYPE, COMPANY_LABELS_TYPE_ARR } from '@/config/global'
import * as z from 'zod'

// Client schema matching the Prisma model
export const clientSchema = z.object({
  id: z.string(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  phone: z.string().nullable().optional(),
  label: z.string().nullable().optional(),
  email: z
    .string()
    .email({ message: 'Invalid email address' })
    .nullable()
    .optional(),
  isCompany: z.boolean().nullable().optional(),
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
  cityId: z.string().nullable().optional(),
  provinceId: z.string().nullable().optional(),
  countryId: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  province: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  zip: z.string().nullable().optional(),
  _count: z
    .object({
      Orders: z.number().nullable().optional()
    })
    .nullable()
    .optional()
})

export type ClientSchemaType = z.infer<typeof clientSchema>
