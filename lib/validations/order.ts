// const Customer = z.object({
//   fullName: z.string().optional(),
//   phone: z
//     .string()
//     .min(9, { message: 'A phone should be at least 9 digits' })
//     .max(10, { message: 'A phone should be at most 10 digits' })
// })

// const TechnicalDetails = z.object({
//   brand: z.string().optional(),
//   model: z.string().optional(),
//   type: z.string().optional(),
//   pas: z.number().positive(),
//   nr: z.string().optional(),
//   ec: z.string().optional(),
//   lar1: z.string().optional(),
//   lon: z.string().optional(),
//   lar2: z.string().optional()
// })

// export const OrderSchema = z.object({
//   id: z.string().length(8, {
//     message: "L'ID de commande doit comporter 8 caractères."
//   }),
//   title: z.string().optional(),
//   receivingDate: z.date(),
//   startDate: z.date(),
//   endDate: z.date(),
//   actualEndDate: z.date(),
//   customer: Customer.optional(),
//   progress: z.number().max(1).min(0).optional()
// })

// export type TimelineOrderRecord = z.infer<typeof OrderSchema>

// export const OrderCommercialView = z.object({
//   id: z.string().min(1, {
//     message: "L'ID de commande doit comporter plus d'un caractère."
//   }),
//   productionDays: z.number().min(1, {
//     message: 'Le nombre de jours de production doit être supérieur à un jour.'
//   }),
//   serialNumber: z.string().optional(),
//   receivingDate: z.string().optional(),
//   quantity: z.string().optional(),
//   price: z.string().optional(),
//   deposit: z.string().optional(),
//   manufacturing: z.string().optional(),
//   type: z.string().optional(),
//   remaining: z.string().optional(),
//   status: z.string().optional(),
//   customer: Customer.optional(),
//   technical: TechnicalDetails.optional()
// })

// export const OrderTechnicalView = z.object({
//   id: z.string().optional(),
//   serialNumber: z.string().optional(),
//   type: z.string().optional(),
//   technical: TechnicalDetails
// })

// export const OrderProductionView = z.object({
//   id: z.string().optional(),
//   startDate: z.string().optional(),
//   status: z.string().optional(),
//   endDate: z.string().optional(),
//   type: z.string().optional(),
//   actualEndDate: z.string().optional(),
//   productionDays: z.number().optional(),
//   quantity: z.number().positive().optional(),
//   progress: z.number().min(-1).optional(),
//   receivingDate: z.string().optional(),
//   technical: TechnicalDetails.optional()
// })

import * as z from 'zod'
import { contentSchema } from './tiptap'
import { paymentSchema } from './payment'

export const clientValidationSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string().nullable(),
  label: z.string().nullable(),
  isCompany: z.boolean(),
  _count: z
    .object({
      orders: z.number()
    })
    .optional(),
  address: z
    .object({
      city: z.object({
        name: z.string()
      })
    })
    .optional()
})

export type ClientValidationType = z.infer<typeof clientValidationSchema>

const dimensionSchema = z.object({
  thickness: z.number().positive().optional(),
  width: z.number().min(0),
  height: z.number().min(0)
})

const collectorSchema = z.object({
  position: z.string().optional().default('C'),
  material: z.string().optional().default('Laiton'),
  tightening: z.string().optional().default('P'),
  perforation: z.string().optional().default('Perforé'),
  isTinned: z.boolean().optional().default(false),
  upperDimensions: dimensionSchema,
  lowerDimensions: dimensionSchema.optional()
})

// Modified core schema to make dimensions conditionally required
const coreSchema = z.object({
  fins: z.string().optional().default('D'),
  finsPitch: z.number().positive().optional().default(10),
  tube: z.string().optional().default('7'),
  rows: z.number().positive().optional().default(1),
  dimensions: dimensionSchema
})

export const carValidationSchema = z.object({
  id: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional()
})

export type CarValidationType = z.infer<typeof carValidationSchema>

// Modified order schema to make note required when car is not included
export const articleValidationSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  isCarIncluded: z.boolean().optional().default(true),
  car: carValidationSchema.optional(),
  core: coreSchema.optional(),
  collector: collectorSchema.optional(),
  isModificationIncluded: z.boolean().default(false).optional(),
  modification: contentSchema.optional(),
  note: contentSchema.optional(),
  description: contentSchema.optional(),
  type: z.string(),
  quantity: z.number().positive().optional().default(1),
  fabrication: z.string().optional().default('Confection'),
  cooling: z.string().optional().default('Eau'),
  packaging: z.string().optional().default('Carton'),
  price: z.number().positive().optional(),
  bulkPrice: z.number().positive().optional()
})

export const orderAttachementSchema = z.object({
  id: z.number(),
  name: z.string(),
  url: z.string(),
  type: z.string()
})

export type OrderAttachementType = z.infer<typeof orderAttachementSchema>

export const orderValidationSchema = z.object({
  id: z.string().optional(),
  client: clientValidationSchema.optional(),
  payment: paymentSchema.optional(),
  components: z.array(articleValidationSchema).optional(),
  receivingDate: z
    .string()
    .default(() => new Date().toISOString())
    .optional(),
  endDate: z
    .string()
    .optional()
    .refine((str) => !str || !isNaN(Date.parse(str)), {
      message: 'Invalid Date'
    }),
  attachements: z.array(orderAttachementSchema).optional()
})

export type OrderValidationType = z.infer<typeof orderValidationSchema>
export type ArticleValidationType = z.infer<typeof articleValidationSchema>
