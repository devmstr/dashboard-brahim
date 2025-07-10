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
      position,
      tube,
      designation
    } = radiator

    // Create inventory for the radiator
    const inventory = await prisma.inventory.create({
      data: {
        level: Number.parseInt(quantity.toString() || '0', 5),
        alertAt: 5,
        maxLevel: 500
      }
    })

    // Create price for the radiator
    const price = await prisma.price.create({
      data: {
        unit: 0,
        unitTTC: 0,
        bulk: 0,
        bulkTTC: 0,
        bulkThreshold: 100
      }
    })

    // Create the radiator
    const createdRadiator = await prisma.radiator.create({
      data: {
        id: id,
        partNumber: reference || null,
        category: 'Automobile', // Default category
        directoryId: dirId || null,
        cooling: 'Eau', // Default cooling
        barcode: barcode || null,
        label: designation || null,
        isActive: true,
        inventoryId: inventory.id,
        priceId: price.id,
        betweenCollectors: coreHeight,
        width: coreWidth,
        rows: rows,
        fins: fins,
        pitch: pitch,
        tubeType: tube,
        upperCollectorLength: upperCollectorLength,
        upperCollectorWidth: upperCollectorWidth,
        position: position === 'Center' ? 'Centrer' : 'Dépassée',
        tightening: tightening === 'Plié' ? 'Plié' : 'Boulonné',
        perforation: 'Non Perforé',
        isTinned: false
      }
    })

    console.log(`✅ Created radiator: ${createdRadiator.label}`)
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
