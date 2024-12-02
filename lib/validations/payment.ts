import { z } from 'zod'

export const paymentSchema = z.object({
  price: z.number().positive().optional(),
  deposit: z.number().positive().optional(),
  remaining: z.number().positive().optional(),
  mode: z.string().optional(),
  iban: z.string().optional(),
  endDate: z
    .string()
    .optional()
    .refine((str) => !str || !isNaN(Date.parse(str)), {
      message: 'Invalid Date'
    })
})

export type PaymentType = z.infer<typeof paymentSchema>
