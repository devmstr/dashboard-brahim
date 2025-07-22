import * as z from 'zod'
import { clientSchema } from './client'
import { paymentSchema } from './payment'
import { contentSchema } from './tiptap'
import { newCarSchema } from '@/app/dashboard/cars/new-car.form'

// Car-related schemas
export const vehicleSchema = z.object({
  Model: z
    .object({
      id: z.string(),
      name: z.string().nullable()
    })
    .optional(),
  Family: z
    .object({
      id: z.string(),
      name: z.string().nullable()
    })
    .optional(),
  Brand: z
    .object({
      id: z.string(),
      name: z.string().nullable()
    })
    .optional(),
  id: z.string().optional(),
  name: z.string().optional(),
  year: z.string().optional().nullable(),
  fuel: z.string().optional().nullable()
})

export type VehicleSchemaType = z.infer<typeof vehicleSchema>

// Attachment schema
export const attachmentSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  uniqueName: z.string().optional(),
  url: z.string().optional(),
  path: z.string().optional(),
  type: z.string().optional()
})

export type Attachment = z.infer<typeof attachmentSchema>

// Order schema - matches the Prisma Order model
export const orderItemSchema = z.object({
  id: z.string(),
  type: z.string().optional().nullable(),
  note: contentSchema.optional().nullable(),
  description: contentSchema.optional().nullable(),
  modification: contentSchema.optional().nullable(),
  packaging: z.string().optional().nullable(),
  fabrication: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  cooling: z.string().optional().nullable(),
  isModified: z.boolean().optional().nullable(),
  isTinned: z.boolean().optional().nullable(),
  isPainted: z.boolean().optional().nullable(),
  quantity: z.number().optional().nullable(),
  fins: z.string().optional().nullable(),
  pitch: z.number().optional().nullable(),
  tubeType: z.string().optional().nullable(),
  tubeDiameter: z.number().optional().nullable(),
  rows: z.number().optional().nullable(),
  betweenCollectors: z.number().optional().nullable(),
  width: z.number().optional().nullable(),
  position: z.string().optional().nullable(),
  tightening: z.string().optional().nullable(),
  perforation: z.string().optional().nullable(),
  upperCollectorLength: z.number().optional().nullable(),
  lowerCollectorLength: z.number().optional().nullable(),
  upperCollectorWidth: z.number().optional().nullable(),
  lowerCollectorWidth: z.number().optional().nullable(),
  orderId: z.string().optional().nullable(),
  dirId: z.string().optional().nullable(),
  radiatorId: z.string().optional().nullable(),
  Vehicle: vehicleSchema.optional().nullable(),
  Model: newCarSchema.optional().nullable()
})

export type OrderItem = z.infer<typeof orderItemSchema>

// OrderBatch schema - matches the Prisma OrderBatch model
export const orderSchema = z.object({
  id: z.string().optional(),
  deadline: z.string().optional(),
  status: z.string().optional(),
  progress: z.number().optional(),
  paymentId: z.string().optional(),
  Payment: paymentSchema.optional(), // For including payment data
  clientId: z.string().optional(),
  Client: clientSchema.optional(), // For including client data
  OrderItems: z.array(orderItemSchema).optional(),
  Attachments: z.array(attachmentSchema).optional()
})

export type Order = z.infer<typeof orderSchema>
