import { COMPANY_LABELS_TYPE, COMPANY_LABELS_TYPE_ARR } from '@/config/global'
import * as z from 'zod'

// Client schema matching the Prisma model
export const clientSchema = z.object({
  id: z.string(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  phone: z.string().optional(),
  label: z.string().optional(),
  email: z.string().email({ message: 'Invalid email address' }).optional(),
  isCompany: z.boolean().default(false),
  website: z.string().url({ message: 'Invalid website URL' }).optional(),
  tradeRegisterNumber: z.string().optional(),
  fiscalNumber: z.string().optional(),
  registrationArticle: z.string().optional(),
  taxIdNumber: z.string().optional(),
  statisticalIdNumber: z.string().optional(),
  approvalNumber: z.string().optional(),
  // Address fields
  addressId: z.string().optional(),
  street: z.string().optional(),
  cityId: z.string().optional(),
  provinceId: z.string().optional(),
  countryId: z.string().optional(),
  country: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  _count: z
    .object({
      Orders: z.number().optional()
    })
    .optional()
})

export type ClientSchemaType = z.infer<typeof clientSchema>
