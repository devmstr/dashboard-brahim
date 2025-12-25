import { PrismaClient } from '@prisma/client'
import SPE_ALL from '../seed/2025.json'
import STD25FE from '../seed/STD-25-FE.json'
import STD25RA from '../seed/STD-25-RA.json'
import crypto from 'crypto'
import { generateId } from '../helpers/id-generator'

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

interface RadiatorData {
  id: string
  orderId: string
  dirId: string
  barcode: string
  reference: string
  quantity: number
  cooling: string
  fabrication: string
  production: string
  type: string
  client: string
  brand: string
  model: string
  fins: string
  pitch: number
  rows: number
  betweenCollectors: number
  width: number
  upperCollectorLength: number
  upperCollectorWidth: number
  lowerCollectorLength: number
  lowerCollectorWidth: number
  tightening: string
  position: string
  tube: string
  designation: string
  hash: string
}

function generateHash(data: RadiatorData): string {
  const hashString = `${data.reference}-${data.designation}-${data.betweenCollectors}-${data.width}`
  return crypto.createHash('sha256').update(hashString).digest('hex')
}

async function main() {
  console.log('🌱 Starting seeding from 2025.json...')

  try {
    // Clean up existing data if needed
    console.log('🧹 Cleaning up existing data...')
    // await prisma.orderItem.deleteMany()
    // await prisma.component.deleteMany()
    // await prisma.radiator.deleteMany()
    // await prisma.inventory.deleteMany()
    // await prisma.price.deleteMany()

    let processedCount = 0
    let skippedCount = 0

    const data = [...SPE_ALL, ...STD25FE, ...STD25RA]

    for (const radiatorData of data) {
      try {
        // Create inventory for the radiator
        const inventory = await prisma.inventory.create({
          data: {
            level: 1,
            alertAt: 5,
            maxLevel: 100
          }
        })

        // Create price for the radiator (using some default values)
        const price = await prisma.price.create({
          data: {
            unit: 0,
            bulk: 0,
            unitTTC: 0,
            bulkTTC: 0,
            bulkThreshold: 10
          }
        })

        // Map the cooling type
        const coolingType =
          radiatorData.cooling === 'Eau'
            ? 'Eau'
            : radiatorData.cooling === 'Air'
            ? 'Air'
            : radiatorData.cooling === 'Huile'
            ? 'Huile'
            : 'Eau'

        // Determine category based on type and other factors
        const category =
          radiatorData.type === 'Radiateur' ? 'Automobile' : 'Industriel'

        const model = await prisma.type.findFirst({
          where: {
            name: radiatorData.model
          }
        })

        // generate a unique ID for the radiator
        const id = generateId(
          radiatorData.designation?.substring(0, 2) as
            | 'RA'
            | 'FA'
            | 'FE'
            | 'RE'
            | 'SP'
        )

        const radiator = await prisma.radiator.create({
          data: {
            id,
            // partNumber: radiatorData.reference,
            label: `${radiatorData.designation} ${radiatorData.brand} ${radiatorData.model}`,
            partNumber: null,
            type: radiatorData.type,
            fabrication: radiatorData.fabrication,
            category: category,
            dirId: undefined,
            cooling: coolingType,
            barcode: radiatorData.barcode || undefined,
            hash: radiatorData.hash,
            isActive: radiatorData.production === 'Fini',
            inventoryId: inventory.id,
            priceId: price.id,
            betweenCollectors: radiatorData.betweenCollectors,
            width: radiatorData.width,
            rows: radiatorData.rows,
            fins: radiatorData.fins,
            pitch: radiatorData.pitch,
            tubeType: radiatorData.tube,
            upperCollectorLength: radiatorData.upperCollectorLength,
            upperCollectorWidth: radiatorData.upperCollectorWidth,
            lowerCollectorLength: radiatorData.lowerCollectorLength,
            lowerCollectorWidth: radiatorData.lowerCollectorWidth,
            position:
              radiatorData.position === 'Center' ? 'Centrer' : 'Dépassée',
            tightening:
              radiatorData.tightening === 'Plié' ? 'Plié' : 'Boulonné',
            perforation: 'Non Perforé',
            isTinned: false,
            ...(model
              ? {
                  CarType: {
                    connect: {
                      id: model.id
                    }
                  }
                }
              : {})
          }
        })

        processedCount++
        console.log(
          `✅ Processed radiator ${processedCount}/${data.length}: ${radiatorData.reference}`
        )
      } catch (error) {
        skippedCount++
        console.error(
          `❌ Error processing radiator ${radiatorData.reference}:`,
          error
        )
        continue
      }
    }

    console.log(`✨ Seeding completed!`)
    console.log(`📊 Processed: ${processedCount} radiators`)
    console.log(`⚠️  Skipped: ${skippedCount} radiators`)
  } catch (error) {
    console.error('❌ Error reading or parsing 2025.json:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
