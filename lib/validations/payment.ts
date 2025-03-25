import { z } from 'zod'

export const paymentSchema = z.object({
  price: z.number().positive().optional(),
  deposit: z.number().positive().optional(),
  remaining: z.number().positive().optional(),
  mode: z
    .enum([
      'Espèces',
      'Versement',
      'Espèces + Versement',
      'Virement',
      'Cheque',
      'À terme'
    ])
    .optional(),
  iban: z.string().optional(),
  depositor: z.string().optional(),
  endDate: z
    .string()
    .optional()
    .refine((str) => !str || !isNaN(Date.parse(str)), {
      message: 'Invalid Date'
    }),
  discountRate: z.number().positive().max(100).optional(),
  refundRate: z.number().positive().max(100).optional(),
  stampTaxRate: z.number().default(0.01)
})

export type PaymentType = z.infer<typeof paymentSchema>
