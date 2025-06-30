import { PrismaClient } from '@prisma/client'
import radiatorData from './data/2025.json'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean up existing data if needed
  await prisma.order.deleteMany()
  await prisma.materialUsage.deleteMany()
  await prisma.component.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.radiator.deleteMany()

  console.log('🧹 Cleaned up existing data')

  // Seed radiators from JSON data
  for (const radiator of radiatorData) {
    const {
      id,
      orderId,
      dirId,
      barcode,
      reference,
      quantity,
      fabrication,
      client,
      brand,
      model,
      fins,
      pitch,
      rows,
      coreHeight,
      coreWidth,
      upperCollectorLength,
      upperCollectorWidth,
      lowerCollectorLength,
      lowerCollectorWidth,
      tightening,
      tube,
      designation
    } = radiator

    // Create inventory for the radiator
    const inventory = await prisma.inventory.create({
      data: {
        level: Number.parseInt(quantity || '0', 10),
        alertAt: 10,
        maxLevel: 500
      }
    })

    // Create price for the radiator
    const price = await prisma.price.create({
      data: {
        unit: 100,
        unitTTC: 120,
        bulk: 80,
        bulkTTC: 96,
        bulkThreshold: 10
      }
    })

    // Create the radiator
    const createdRadiator = await prisma.radiator.create({
      data: {
        id: id,
        reference: reference || null,
        category: 'Automobile', // Default category
        dir: dirId || null,
        cooling: 'Eau', // Default cooling
        barcode: barcode || null,
        label: designation || null,
        isActive: true,
        inventoryId: inventory.id,
        priceId: price.id
      }
    })

    console.log(`✅ Created radiator: ${createdRadiator.label}`)

    // Create a core component
    await prisma.component.create({
      data: {
        name: `Core for ${reference}`,
        type: 'CORE',
        radiatorId: createdRadiator.id,
        Metadata: {
          coreHeight: coreHeight,
          coreWidth: coreWidth,
          rows: rows,
          fins: fins,
          pitch: pitch,
          tube: tube
        }
      }
    })
  }

  console.log('✨ Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
