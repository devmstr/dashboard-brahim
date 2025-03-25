import { z } from 'zod'

export const inventorySchema = z.object({
  // Inventory information
  reference: z.string(),
  designation: z.string().optional(),
  location: z
    .string()
    .min(1, { message: 'Veuillez sélectionner un emplacement' }),

  // Inventory levels
  minStockLevel: z.coerce.number().int().nonnegative(),
  stockLevel: z.coerce.number().int().nonnegative(),
  maxStockLevel: z.coerce.number().int().positive(),

  // pricing
  price: z.number().optional(),
  bulkPrice: z.number().optional(),
  bulkPriceThreshold: z.number().optional(),

  // Status
  isActive: z.boolean().default(true)
})

export type InventoryType = z.infer<typeof inventorySchema>
