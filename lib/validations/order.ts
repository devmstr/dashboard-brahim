import * as z from 'zod'
import { contentSchema } from './tiptap'
import { paymentSchema } from './payment'

// Client schema
export const clientSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  isCompany: z.boolean(),
  email: z.string().optional(),
  label: z.string().optional(),
  addressId: z.string().optional()
})

export type Client = z.infer<typeof clientSchema>

// Car-related schemas
export const carSchema = z.object({
  id: z.string(),
  brand: z.string(),
  model: z.string()
})

export type Car = z.infer<typeof carSchema>

// Dimension schema for components
const dimensionsSchema = z.object({
  thickness: z.number().positive().optional(),
  width: z.number().min(0),
  height: z.number().min(0)
})

export type Dimensions = z.infer<typeof dimensionsSchema>

// Component schemas
const collectorSchema = z.object({
  position: z.enum(['Centrer', 'Dépassée']).optional(),
  material: z.enum(['Acier', 'Laiton']).optional(),
  tightening: z.enum(['Plié', 'Boulonné']).optional(),
  perforation: z.enum(['Perforé', 'Non Perforé']).optional(),
  isTinned: z.boolean().default(false).optional(),
  dimensions1: dimensionsSchema,
  dimensions2: dimensionsSchema.optional()
})

export type Collector = z.infer<typeof collectorSchema>

const coreSchema = z.object({
  fins: z.enum(['Normale', 'Aérer', 'Zigzag']).optional(),
  finsPitch: z.enum(['10', '11', '12', '14']).optional(),
  tube: z.enum(['ET7', 'ET9', 'MP']).optional(),
  rows: z.number().positive().optional().default(1),
  dimensions: dimensionsSchema
})

export type Core = z.infer<typeof coreSchema>

// Attachment schema
export const attachmentSchema = z.object({
  id: z.number(),
  name: z.string(),
  uniqueName: z.string().optional(),
  url: z.string(),
  path: z.string().optional(),
  type: z.string()
})

export type Attachment = z.infer<typeof attachmentSchema>

// Order schema - matches the Prisma Order model
export const orderItemSchema = z.object({
  id: z.string().optional(),
  type: z.string().optional(),
  note: contentSchema.optional(),
  description: contentSchema.optional(),
  modification: contentSchema.optional(),
  packaging: z.string().nullable().optional(),
  fabrication: z.string().nullable().optional(),
  label: z.string().optional(),
  category: z.string().optional(),
  cooling: z.string().optional(),
  isModified: z.string().nullable().optional(),
  quantity: z.number().positive().optional().default(1),
  Core: coreSchema.optional(),
  Collector: collectorSchema.optional(),
  Pricing: z
    .object({
      price: z.number().optional(),
      bulkPrice: z.number().optional()
    })
    .optional(),
  // Relations
  radiatorId: z.string().optional(),
  orderId: z.string().nullable().optional(),
  Attachments: z.array(attachmentSchema).optional(),
  Car: carSchema.optional()
})

export type OrderItem = z.infer<typeof orderItemSchema>

// OrderBatch schema - matches the Prisma OrderBatch model
export const orderSchema = z.object({
  id: z.string().optional(),
  deadline: z
    .string()
    .default(() => new Date().toISOString())
    .optional(),
  state: z.string().optional(),
  progress: z.number().min(0).max(100).default(0).optional(),
  // Relations
  paymentId: z.string().optional(),
  Payment: paymentSchema.optional(), // For including payment data
  clientId: z.string().optional(),
  Client: clientSchema.optional(), // For including client data
  OrderItems: z.array(orderItemSchema).optional(),
  Attachments: z.array(attachmentSchema).optional()
})

export type Order = z.infer<typeof orderSchema>
