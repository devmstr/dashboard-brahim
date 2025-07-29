import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import crypto, { createHash } from 'crypto'
import { skuId } from '../lib/utils'

const prisma = new PrismaClient()

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

export interface LabelConfig {
  type: 'Faisceau' | 'Radiateur' | 'Spirale'
  fabrication: 'Confection' | 'Rénovation'
  fins: 'Normale' | 'Zigzag' | 'Aérer'
  tube: 'ET7' | 'ET9' | 'MP'
  pitch: number
  width: number
  betweenCollectors: number
  rows: number
  upperCollectorLength: number
  upperCollectorWidth: number
  lowerCollectorLength: number
  lowerCollectorWidth: number
  tightening: 'Plié' | 'Boulonné'
  position: 'Center' | 'Dépassé'
  cooling: 'Air' | 'Eau' | 'Huile'
}

type HashConfig = Pick<
  LabelConfig,
  | 'lowerCollectorLength'
  | 'lowerCollectorWidth'
  | 'upperCollectorLength'
  | 'upperCollectorWidth'
  | 'betweenCollectors'
  | 'width'
  | 'cooling'
  | 'fins'
  | 'pitch'
  | 'position'
  | 'rows'
  | 'tightening'
  | 'tube'
  | 'type'
  | 'fabrication'
> & { dirId: string }

function asExactHashConfig<T extends HashConfig>(
  value: T & Record<Exclude<keyof T, keyof HashConfig>, never>
): HashConfig {
  return value
}

export function generateHash(data: any): string {
  const cfg = asExactHashConfig(data)
  const stableString = JSON.stringify(
    Object.keys(cfg)
      .sort()
      .reduce((acc, key) => {
        acc[key] = (cfg as any)[key]
        return acc
      }, {} as any)
  )
  return createHash('sha256').update(stableString).digest('hex')
}

async function main() {
  console.log('🌱 Starting seeding from 2025.json...')

  try {
    // Read the JSON file
    const jsonPath = path.join(process.cwd(), 'seed', 'data', '2025.json')
    const jsonData = fs.readFileSync(jsonPath, 'utf-8')
    const radiatorDataArray: RadiatorData[] = JSON.parse(jsonData)

    console.log(`📄 Found ${radiatorDataArray.length} radiators in 2025.json`)

    // Clean up existing data if needed
    console.log('🧹 Cleaning up existing data...')
    await prisma.orderItem.deleteMany()
    await prisma.component.deleteMany()
    await prisma.radiator.deleteMany()
    await prisma.inventory.deleteMany()
    await prisma.price.deleteMany()

    let processedCount = 0
    let skippedCount = 0

    for (const radiatorData of radiatorDataArray) {
      try {
        // generate a unique ID for the radiator
        const id = skuId(
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
            status: 'ACTIVE',
            category: 'Automobile',
            dirId: radiatorData.dirId,
            cooling: radiatorData.cooling ?? 'Eau',
            // barcode: radiatorData.barcode ?? null,
            hash: radiatorData.hash,
            isActive: true,
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
            Price: {
              create: {
                unit: 0,
                bulk: 0,
                unitTTC: 0,
                bulkTTC: 0,
                bulkThreshold: 10
              }
            },
            Inventory: {
              create: {
                level: 1,
                alertAt: 5,
                maxLevel: 100
              }
            }
          }
        })

        // // Create upper collector component
        // await prisma.component.create({
        //   data: {
        //     label: `Collecteur Supérieur ${radiatorData.reference}`,
        //     type: 'COLLECTOR',
        //     radiatorId: radiator.id,
        //     MaterialUsages: {
        //       create: {
        //         quantity: 1,
        //         Material: {
        //           connectOrCreate: {
        //             where: {
        //               reference: 'BNL06'
        //             },
        //             create: {
        //               reference: 'BNL06',
        //               name: 'Laiton',
        //               unit: 'grammes',
        //               baseUnit: 'mètre',
        //               conversionFactor: 150, // 150g/m
        //               unitCost: 0.012
        //             }
        //           }
        //         }
        //       }
        //     }
        //   }
        // })

        // // Create lower collector component
        // await prisma.component.create({
        //   data: {
        //     label: `Collecteur inférieur ${radiatorData.reference}`,
        //     type: 'COLLECTOR',
        //     radiatorId: radiator.id,
        //     MaterialUsages: {
        //       create: {
        //         quantity: 1,
        //         Material: {
        //           connectOrCreate: {
        //             where: {
        //               reference: 'BNL06'
        //             },
        //             create: {
        //               reference: 'BNL06',
        //               name: 'Laiton',
        //               unit: 'grammes',
        //               baseUnit: 'mètre',
        //               conversionFactor: 150, // 150g/m
        //               unitCost: 0.012
        //             }
        //           }
        //         }
        //       }
        //     }
        //   }
        // })

        processedCount++
        console.log(
          `✅ Processed radiator ${processedCount}/${radiatorDataArray.length}: ${radiatorData.reference}`
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
