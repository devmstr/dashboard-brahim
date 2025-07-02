import * as z from 'zod'
import { contentSchema } from './tiptap'
import { paymentSchema } from './payment'
import {
  CATEGORY_TYPES,
  CATEGORY_TYPES_ARR,
  CLAMPING_TYPES,
  COLLECTOR_MATERIALS_TYPES,
  COLLECTOR_POSITION_TYPES,
  COOLING_SYSTEMS_TYPES,
  COOLING_SYSTEMS_TYPES_ARR,
  FABRICATION_TYPES,
  ORDER_TYPES,
  PACKAGING_TYPES,
  PERFORATION_TYPES,
  STATUS_TYPES
} from '@/config/global'

// Client schema
export const clientSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  isCompany: z.boolean(),
  email: z.string().nullable().optional(),
  label: z.string().nullable().optional(),
  addressId: z.string().nullable().optional()
})

export type Client = z.infer<typeof clientSchema>

// Car-related schemas
export const carSchema = z.object({
  id: z.string(),
  brand: z.string(),
  model: z.string(),
  family: z.string().optional(),
  type: z.string().optional(),
  fuel: z.enum(['Essence', 'Diesel']).optional(),
  productionYears: z
    .string()
    .regex(/^\d{4}–\d{4}$/, {
      message: 'Must be in the format YYYY–YYYY'
    })
    .optional()
})

export type Car = z.infer<typeof carSchema>

// Dimension schema for components
const dimensionsSchema = z.object({
  thickness: z.number().min(0).optional(),
  diameter: z.number().min(0).optional(),
  width: z.number().min(0),
  height: z.number().min(0)
})

export type Dimensions = z.infer<typeof dimensionsSchema>

// Component schemas
const collectorSchema = z.object({
  position: z.enum(COLLECTOR_POSITION_TYPES).optional(),
  material: z.enum(COLLECTOR_MATERIALS_TYPES).optional(),
  tightening: z.enum(CLAMPING_TYPES).optional(),
  perforation: z.enum(PERFORATION_TYPES).optional(),
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
  id: z.string(),
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
  type: z.enum(ORDER_TYPES).optional(),
  note: contentSchema.optional(),
  description: contentSchema.optional(),
  modification: contentSchema.optional(),
  packaging: z.enum(PACKAGING_TYPES).optional(),
  fabrication: z.enum(FABRICATION_TYPES).optional(),
  label: z.string().optional(),
  state: z.string().optional(),
  category: z.enum(CATEGORY_TYPES).optional(),
  cooling: z.enum(COOLING_SYSTEMS_TYPES).optional(),
  isModified: z.boolean().nullable().optional(),
  quantity: z.number().positive().optional().default(1),
  Core: coreSchema.optional(),
  Collector: collectorSchema.optional(),
  radiatorId: z.string().optional(),
  orderId: z.string().nullable().optional(),
  Attachments: z.array(attachmentSchema).optional(),
  Car: carSchema.optional(),
  Radiator: z.any().optional()
})

export type OrderItem = z.infer<typeof orderItemSchema>

// OrderBatch schema - matches the Prisma OrderBatch model
export const orderSchema = z.object({
  id: z.string().optional(),
  deadline: z
    .string()
    .default(() => new Date().toISOString())
    .optional(),
  state: z.enum(STATUS_TYPES).optional(),
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
