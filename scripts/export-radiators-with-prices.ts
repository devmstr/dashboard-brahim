import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const DATABASE_URL =
  process.env.SECONDARY_DATABASE_URL ||
  'postgres://sonerasserver:iYKzC3xpiaWece3Pmi29SD@192.168.1.199:5432/sonerasflowdb'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
})

const OUTPUT_PATH = path.join(
  process.cwd(),
  'seed',
  'radiators-with-prices.json'
)

async function main() {
  console.log('📦 Exporting radiators with prices...')

  const radiators = await prisma.radiator.findMany({
    include: {
      Price: true,
      Inventory: true,
      InventoryItem: {
        include: {
          Invoice: true
        }
      }
    }
  })

  const data = radiators.map((radiator) => {
    const { Price, Inventory, InventoryItem, ...radiatorData } = radiator
    return {
      radiator: radiatorData,
      price: Price,
      inventory: Inventory,
      invoiceItems: InventoryItem
    }
  })

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2))
  console.log(`✅ Saved ${data.length} radiators to ${OUTPUT_PATH}`)
}

main()
  .catch((error) => {
    console.error('❌ Export failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
