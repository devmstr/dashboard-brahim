import {
  ORDER_TYPES,
  FABRICATION_TYPES,
  STATUS_TYPES,
  CATEGORY_TYPES,
  COOLING_SYSTEMS_TYPES,
  COLLECTOR_POSITION_TYPES,
  CLAMPING_TYPES,
  PERFORATION_TYPES
} from '@/config/global'
import { z } from 'zod'
import { vehicleSchema } from './order'
import { newCarSchema } from '@/app/dashboard/cars/new-car.form'

export const radiatorSchema = z.object({
  id: z.string(),
  partNumber: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  fabrication: z.string().optional().nullable(),
  production: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  cooling: z.string().optional().nullable(),
  fins: z.string().optional().nullable(),
  pitch: z.number().optional().nullable(),
  tubeType: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  tightening: z.string().optional().nullable(),
  perforation: z.string().optional().nullable(),
  dirId: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
  hash: z.string().optional().nullable(),
  rows: z.number().optional().nullable(),
  tubeDiameter: z.number().optional().nullable(),
  betweenCollectors: z.number().optional().nullable(),
  width: z.number().optional().nullable(),
  isTinned: z.boolean().optional().nullable(),
  isPainted: z.boolean().optional().nullable(),
  upperCollectorLength: z.number().optional().nullable(),
  lowerCollectorLength: z.number().optional().nullable(),
  upperCollectorWidth: z.number().optional().nullable(),
  lowerCollectorWidth: z.number().optional().nullable(),
  isActive: z.boolean().optional().nullable(),
  Vehicle: newCarSchema.optional(),
  Components: z
    .array(
      z.object({
        usages: z
          .array(
            z.object({
              id: z.string(),
              quantity: z.number().optional().nullable(),
              reference: z.string().optional().nullable(),
              name: z.string().optional().nullable(),
              description: z.string().optional().nullable(),
              unit: z.string().optional().nullable(),
              baseUnit: z.string().optional().nullable(),
              conversionFactor: z.number().optional().nullable(),
              unitCost: z.number().optional().nullable()
            })
          )
          .optional(),
        id: z.string(),
        label: z.string().optional().nullable(),
        type: z.string().optional().nullable(),
        radiatorId: z.string().optional().nullable()
      })
    )
    .optional()
})

export type RadiatorSchemaType = z.infer<typeof radiatorSchema>
