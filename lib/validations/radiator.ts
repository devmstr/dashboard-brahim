import {
  ORDER_TYPES,
  PACKAGING_TYPES,
  FABRICATION_TYPES,
  STATUS_TYPES,
  CATEGORY_TYPES,
  COOLING_SYSTEMS_TYPES,
  COLLECTOR_POSITION_TYPES,
  CLAMPING_TYPES,
  PERFORATION_TYPES
} from '@/config/global'
import { z } from 'zod'

export const radiatorSchema = z.object({
  id: z.string(),
  partNumber: z.string().nullable().optional(),
  type: z.enum(ORDER_TYPES).default('Radiateur'),
  packaging: z.enum(PACKAGING_TYPES).default('Carton'),
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
  dirId: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  label: z.string().nullable().optional(),
  hash: z.string().nullable().optional(),
  rows: z.number().nullable().optional(),
  tubeDiameter: z.number().nullable().optional(),
  betweenCollectors: z.number().nullable().optional(),
  width: z.number().nullable().optional(),
  isTinned: z.boolean().nullable().optional(),
  isPainted: z.boolean().nullable().optional(),
  upperCollectorLength: z.number().nullable().optional(),
  lowerCollectorLength: z.number().nullable().optional(),
  upperCollectorWidth: z.number().nullable().optional(),
  lowerCollectorWidth: z.number().nullable().optional(),
  isActive: z.boolean().nullable().optional()
})

export type radiatorSchemaType = z.infer<typeof radiatorSchema>
