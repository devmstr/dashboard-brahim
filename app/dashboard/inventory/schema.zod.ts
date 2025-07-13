import { z } from 'zod'

export const inventorySchema = z.object({
  // Inventory information
  id: z.string(),
  label: z.string().optional(),
  location: z.string().optional(),

  // Inventory levels
  minStockLevel: z.number().int().nonnegative().optional(),
  stockLevel: z.number().int().nonnegative().optional(),
  maxStockLevel: z.number().int().nonnegative().optional(),

  // pricing
  price: z.number().optional(),
  priceTTC: z.number().optional(),
  bulkPrice: z.number().optional(),
  bulkPriceTTC: z.number().optional(),
  bulkPriceThreshold: z.number().optional(),

  // Status
  isActive: z.boolean().default(true).optional()
})

export type InventoryType = z.infer<typeof inventorySchema>
