import { z } from 'zod'

// Car validation schema
export const carValidationSchema = z.object({
  id: z.string().optional(),
  model: z.string().optional(),
  brand: z.string().optional()
})

// Core dimensions validation schema
export const coreDimensionsSchema = z.object({
  height: z.number().min(0),
  width: z.number().min(0)
})

// Core validation schema
export const coreValidationSchema = z.object({
  fins: z.string(), // "Z", "A", "D" etc.
  finsPitch: z.number().int().min(10).max(14), // 10, 11, 12, 14
  tube: z.string(), // "7", "9", "M" etc.
  rows: z.number().int().min(1),
  dimensions: coreDimensionsSchema
})

// Collector dimensions validation schema
export const collectorDimensionsSchema = z.object({
  height: z.number().min(0),
  width: z.number().min(0),
  thickness: z.number().min(0)
})

// Collector validation schema
export const collectorValidationSchema = z.object({
  isTinned: z.boolean().default(false),
  perforation: z.string(), // "Perforé" etc.
  tightening: z.string(), // "P", "B" etc.
  position: z.string(), // "C", "D" etc.
  material: z.string(), // "Laiton" etc.
  upperDimensions: collectorDimensionsSchema,
  lowerDimensions: collectorDimensionsSchema.optional()
})

// File attachment validation schema
export const fileAttachmentSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
  url: z.string().url().optional()
})

// Main radiator validation schema
export const radiatorValidationSchema = z.object({
  id: z.string().optional(),
  type: z.string(), // "Radiateur", "Faisceau" etc.
  fabrication: z.string(), // "Confection", "Renovation" etc.
  cooling: z.string(), // "Eau", "Air", "Huile" etc.
  packaging: z.string(), // "Carton" etc.
  quantity: z.number().int().min(1),
  dirId: z.string().optional(), // Directory ID
  description: z.any().optional(), // JSON in the database
  note: z.any().optional(), // JSON in the database
  modification: z.any().optional(), // JSON in the database
  car: carValidationSchema.optional(),
  core: coreValidationSchema,
  collector: collectorValidationSchema,
  radiatorAttachment: z.array(fileAttachmentSchema).optional(),
  reference: z.string().optional(),
  category: z.string().optional(),
  dir: z.string().optional(),
  barcode: z.string().optional(),
  label: z.string().optional(),
  isActive: z.boolean().optional().default(false)
})

// Export the type
export type RadiatorValidationType = z.infer<typeof radiatorValidationSchema>

// For backward compatibility with your existing code
export const articleValidationSchema = radiatorValidationSchema
export type ArticleValidationType = RadiatorValidationType
