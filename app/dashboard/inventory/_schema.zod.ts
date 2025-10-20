import { z } from 'zod'

export const StockFormSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  location: z.string().optional(),
  minStockLevel: z.number().int().nonnegative().optional(),
  stockLevel: z.number().int().nonnegative().optional(),
  maxStockLevel: z.number().int().nonnegative().optional(),
  // Status
  isActive: z.boolean().default(true).optional()
})

export type StockFormType = z.infer<typeof StockFormSchema>

const DecimalValue = z
  .union([
    z
      .string()
      .refine((val) => /^\d*\.?\d{0,2}$/.test(val), 'Invalid price format'),
    z.number()
  ])
  .transform((val) => {
    if (typeof val === 'number') return val
    if (val === '') return undefined
    return parseFloat(val)
  })

export const PricingFormSchema = z.object({
  // Inventory information
  id: z.string(),
  label: z.string().optional(),
  location: z.string().optional(),

  // Pricing
  price: DecimalValue.optional(),
  bulkPrice: DecimalValue.optional(),
  bulkPriceThreshold: z.number().optional(),

  // Status
  isActive: z.boolean().default(true).optional()
})

export type PricingFormType = z.infer<typeof PricingFormSchema>
