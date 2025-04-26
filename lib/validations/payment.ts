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
  bank: z
    .enum([
      'Banque Extérieure d’Algérie',
      'Banque Nationale d’Algérie',
      'Société Générale Algérie',
      'Algerian Gulf Bank'
    ])
    .optional(),
  iban: z.string().optional(),
  checkUrl: z.string().url().optional(),
  depositor: z.string().optional(),
  endDate: z
    .string()
    .optional()
    .refine((str) => !str || !isNaN(Date.parse(str)), {
      message: 'Invalid Date'
    })
})

export type PaymentType = z.infer<typeof paymentSchema>
