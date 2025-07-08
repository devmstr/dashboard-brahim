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
import { carSchema } from './order'

export const radiatorSchema = z.object({
  id: z.string(),
  partNumber: z.string().optional(),
  type: z.enum(ORDER_TYPES).default('Radiateur'),
  fabrication: z.enum(FABRICATION_TYPES).default('Confection'),
  production: z.enum(['Fini', 'Semi-Fini']).default('Fini'),
  status: z.enum(STATUS_TYPES).default('Prévu').optional(),
  category: z.enum(CATEGORY_TYPES).default('Automobile'),
  cooling: z.enum(COOLING_SYSTEMS_TYPES).default('Eau'),
  fins: z.enum(['Normale', 'Aérer', 'Zigzag']).optional(),
  pitch: z.enum(['10', '11', '12', '14']).optional(),
  tubeType: z.enum(['ET7', 'ET9', 'MP']).optional(),
  position: z.enum(COLLECTOR_POSITION_TYPES).optional(),
  tightening: z.enum(CLAMPING_TYPES).optional(),
  perforation: z.enum(PERFORATION_TYPES).optional(),
  dirId: z.string().optional(),
  barcode: z.string().optional(),
  label: z.string().optional(),
  hash: z.string().optional(),
  rows: z.number().optional(),
  tubeDiameter: z.number().optional(),
  betweenCollectors: z.number().optional(),
  width: z.number().optional(),
  isTinned: z.boolean().optional(),
  isPainted: z.boolean().optional(),
  upperCollectorLength: z.number().optional(),
  lowerCollectorLength: z.number().optional(),
  upperCollectorWidth: z.number().optional(),
  lowerCollectorWidth: z.number().optional(),
  isActive: z.boolean().optional(),
  Vehicle: carSchema.optional(),
  Components: z
    .array(
      z.object({
        usages: z
          .array(
            z.object({
              id: z.string(),
              quantity: z.number().optional(),
              reference: z.string().optional(),
              name: z.string().optional(),
              description: z.string().optional(),
              unit: z.string().optional(),
              baseUnit: z.string().optional(),
              conversionFactor: z.number().optional(),
              unitCost: z.number().optional()
            })
          )
          .optional(),
        id: z.string(),
        label: z.string().optional(),
        type: z.string().optional(),
        radiatorId: z.string().optional()
      })
    )
    .optional()
})

export type RadiatorSchemaType = z.infer<typeof radiatorSchema>
