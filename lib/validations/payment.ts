import { z } from 'zod'

export const paymentSchema = z.object({
  price: z.number().min(0).default(0).optional(),
  deposit: z.number().min(0).default(0).optional(),
  remaining: z.number().min(0).default(0).optional(),
  mode: z.enum([
    'Espèces',
    'Versement',
    'Espèces + Versement',
    'Virement',
    'Cheque',
    'À terme'
  ]),
  bank: z
    .enum(['BEA', 'BNA', 'SGA', 'AGB'])
    .optional()
    .nullable()
    .default(null),
  iban: z.string().optional().nullable().default(null),
  depositor: z.string().optional().nullable().default(null)
})

export type PaymentType = z.infer<typeof paymentSchema>
