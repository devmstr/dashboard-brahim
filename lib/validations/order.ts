import * as z from 'zod'

const Customer = z.object({
  fullName: z.string().optional(),
  phone: z.string()
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
  id: z.string().optional(),
  serialNumber: z.string().optional(),
  receivingDate: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  actualEndDate: z.string().optional(),
  quantity: z.number().positive(),
  price: z.number().positive(),
  deposit: z.number().positive(),
  remaining: z.number().positive(),
  customer: Customer,
  progress: z.number().positive(),
  technical: TechnicalDetails
})

export const OrderCommercialView = z.object({
  id: z.string().optional(),
  serialNumber: z.string().optional(),
  receivingDate: z.string().optional(),
  quantity: z.string().optional(),
  price: z.string().optional(),
  deposit: z.string().optional(),
  remaining: z.string().optional(),
  customer: Customer,
  technical: TechnicalDetails
})

export const OrderTechnicalView = z.object({
  id: z.string().optional(),
  serialNumber: z.string().optional(),
  technical: TechnicalDetails
})

export const OrderProductionView = z.object({
  id: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  actualEndDate: z.string().optional(),
  quantity: z.number().positive(),
  progress: z.number().positive(),
  technical: TechnicalDetails
})
