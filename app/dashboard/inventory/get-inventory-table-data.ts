import prisma from '@/lib/db'

export async function getInventoryTableData() {
  // Fetch all inventory items with related radiator and price info
  const inventories = await prisma.inventory.findMany({
    include: {
      Radiators: {
        include: {
          Price: true
        }
      }
    }
  })

  // Map to table row format
  return inventories.flatMap((inv) =>
    inv.Radiators.map((rad) => ({
      id: rad.id,
      designation: rad.label || rad.reference || '',
      barcode: rad.barcode || '',
      quantity: inv.level,
      price: rad.Price?.unit ?? undefined,
      bulkPrice: rad.Price?.bulk ?? undefined,
      bulkPriceThreshold: undefined // Add if you have this field
    }))
  )
}
