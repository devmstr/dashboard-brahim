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
import { clientSchema } from './client'

// Car-related schemas
export const carSchema = z.object({
  id: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  family: z.string().optional(),
  type: z.string().nullable().optional(),
  fuel: z.enum(['Essence', 'Diesel']).nullable().optional(),
  year: z
    .string()
    .regex(/^\d{4}–\d{4}$/, {
      message: 'Must be in the format YYYY–YYYY'
    })
    .nullable()
    .optional()
})

export type Car = z.infer<typeof carSchema>

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
  type: z.enum(ORDER_TYPES).default('Radiateur'),
  note: contentSchema.optional(),
  description: contentSchema.optional(),
  modification: contentSchema.optional(),
  packaging: z.enum(PACKAGING_TYPES).default('Carton'),
  fabrication: z.enum(FABRICATION_TYPES).default('Confection'),
  label: z.string().optional(),
  status: z.enum(STATUS_TYPES).default('Prévu').optional(),
  category: z.enum(CATEGORY_TYPES).default('Automobile'),
  cooling: z.enum(COOLING_SYSTEMS_TYPES).default('Eau'),
  isModified: z.boolean().optional(),
  isTinned: z.boolean().optional(),
  isPainted: z.boolean().optional(),
  quantity: z.number().min(0).optional(),
  fins: z.enum(['Normale', 'Aérer', 'Zigzag']).optional(),
  pitch: z.enum(['10', '11', '12', '14']).optional(),
  tubeType: z.enum(['ET7', 'ET9', 'MP']).optional(),
  tubeDiameter: z.number().min(0).optional(),
  rows: z.number().min(0).optional(),
  betweenCollectors: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  position: z.enum(COLLECTOR_POSITION_TYPES).optional(),
  tightening: z.enum(CLAMPING_TYPES).optional(),
  perforation: z.enum(PERFORATION_TYPES).optional(),
  upperCollectorLength: z.number().min(0).optional(),
  lowerCollectorLength: z.number().min(0).optional(),
  upperCollectorWidth: z.number().min(0).optional(),
  lowerCollectorWidth: z.number().min(0).optional(),
  orderId: z.string().optional(),
  Vehicle: carSchema.optional()
})

export type OrderItem = z.infer<typeof orderItemSchema>

// OrderBatch schema - matches the Prisma OrderBatch model
export const orderSchema = z.object({
  id: z.string().optional(),
  deadline: z
    .string()
    .default(() => new Date().toISOString())
    .optional(),
  status: z.enum(STATUS_TYPES).default('Prévu').optional(),
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
