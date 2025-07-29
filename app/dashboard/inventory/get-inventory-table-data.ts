import prisma from '@/lib/db'

export async function getInventoryTableData() {
  // Fetch all inventory items with related radiator and price info
  const inventories = await prisma.radiator.findMany({
    include: {
      Price: true,
      Inventory: true
    }
  })

  // Map to table row format
  return inventories.map((rad) => ({
    id: rad.id,
    designation: rad.label || '',
    barcode: rad.barcode || '',
    quantity: rad.Inventory?.level,
    minLevel: rad.Inventory?.alertAt,
    maxLevel: rad.Inventory?.maxLevel,
    price: rad.Price?.unit ?? 0,
    priceTTC: rad.Price?.unitTTC ?? 0,
    bulkPrice: rad.Price?.bulk ?? 0,
    bulkPriceTTC: rad.Price?.bulkTTC ?? 0,
    bulkPriceThreshold: rad.Price?.bulkThreshold // Add if you have this field
  }))
}
