import * as z from 'zod'

const Customer = z.object({
  fullName: z.string().optional(),
  phone: z
    .string()
    .min(9, { message: 'A phone should be at least 9 digits' })
    .max(10, { message: 'A phone should be at most 10 digits' })
})

const TechnicalDetails = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  type: z.string().optional(),
  pas: z.number().positive(),
  nr: z.string().optional(),
  ec: z.string().optional(),
  lar1: z.string().optional(),
  lon: z.string().optional(),
  lar2: z.string().optional()
})

export const OrderSchema = z.object({
  id: z.string().min(1, {
    message: "L'ID de commande doit comporter plus d'un caractère."
  }),
  serialNumber: z.string().optional(),
  status: z.string().optional(),
  receivingDate: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  productionDays: z.number().min(1, {
    message: 'Le nombre de jours de production doit être supérieur à un jour.'
  }),
  actualEndDate: z.string().optional(),
  quantity: z.string().optional(),
  price: z.string().optional(),
  deposit: z.string().optional(),
  remaining: z.string().optional(),
  manufacturing: z.string().optional(),
  type: z.string().optional(),
  customer: Customer,
  progress: z.string().optional(),
  technical: TechnicalDetails
})

export type TimeLineRecord = z.infer<typeof OrderSchema>

export const OrderCommercialView = z.object({
  id: z.string().min(1, {
    message: "L'ID de commande doit comporter plus d'un caractère."
  }),
  productionDays: z.number().min(1, {
    message: 'Le nombre de jours de production doit être supérieur à un jour.'
  }),
  serialNumber: z.string().optional(),
  receivingDate: z.string().optional(),
  quantity: z.string().optional(),
  price: z.string().optional(),
  deposit: z.string().optional(),
  manufacturing: z.string().optional(),
  type: z.string().optional(),
  remaining: z.string().optional(),
  status: z.string().optional(),
  customer: Customer,
  technical: TechnicalDetails
})

export const OrderTechnicalView = z.object({
  id: z.string().optional(),
  serialNumber: z.string().optional(),
  type: z.string().optional(),
  technical: TechnicalDetails
})

export const OrderProductionView = z.object({
  id: z.string().optional(),
  startDate: z.string().optional(),
  status: z.string().optional(),
  endDate: z.string().optional(),
  type: z.string().optional(),
  actualEndDate: z.string().optional(),
  productionDays: z.number().optional(),
  quantity: z.number().positive().optional(),
  progress: z.number().min(-1).optional(),
  receivingDate: z.string().optional(),
  technical: TechnicalDetails.optional()
})
