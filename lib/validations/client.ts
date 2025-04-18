import * as z from 'zod'

export const clientSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string().nullable(),
  label: z.string().nullable(),
  isCompany: z.boolean(),
  _count: z
    .object({
      Orders: z.number()
    })
    .optional(),
  Address: z
    .object({
      City: z.object({
        name: z.string()
      })
    })
    .optional()
})

export type ClientType = z.infer<typeof clientSchema>
