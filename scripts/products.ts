import { PrismaClient, ComponentType } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

// Constants for the seeding script
const CATEGORIES = ['Radiateur', 'Faisceau', 'Autre']
const COOLING_TYPES = ['Eau', 'Air', 'Huile']
const POSITIONS = ['C', 'D']
const TIGHTENING_TYPES = ['P', 'B']
const MATERIALS = ['Acier', 'Laiton']
const PERFORATIONS = ['Perforé', 'Non Perforé']
const FINS_TYPES = ['Z', 'A', 'D']
const TUBE_TYPES = ['7', '9', 'M']

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean up existing data if needed
  await prisma.component.deleteMany({})
  await prisma.collector.deleteMany({})
  await prisma.core.deleteMany({})
  await prisma.product.deleteMany({})

  console.log('🧹 Cleaned up existing data')

  // Create 10 products with components
  for (let i = 0; i < 10; i++) {
    const category = faker.helpers.arrayElement(CATEGORIES)
    const productReference = `REF-${faker.string.alphanumeric(6).toUpperCase()}`
    const productName = `${category} ${faker.commerce.productName()}`

    // Create the product
    const product = await prisma.product.create({
      data: {
        reference: productReference,
        // name: productName,
        category,
        dir: `data/${faker.string.alphanumeric(8).toUpperCase()}`,
        cooling: faker.helpers.arrayElement(COOLING_TYPES),
        barcode: faker.string.numeric(13),
        label: `${productReference}-${faker.string
          .alphanumeric(4)
          .toUpperCase()}`,
        isActive: faker.datatype.boolean()
      }
    })

    console.log(`✅ Created product: ${product.label}`)

    // Determine number of components (1-3)
    const numComponents = faker.number.int({ min: 1, max: 3 })

    for (let j = 0; j < numComponents; j++) {
      // Randomly choose component type
      const componentType = faker.helpers.arrayElement([
        ComponentType.CORE,
        ComponentType.COLLECTOR
      ])

      if (componentType === ComponentType.CORE) {
        // Create a core
        const core = await prisma.core.create({
          data: {
            width: faker.number.int({ min: 100, max: 800 }),
            height: faker.number.int({ min: 100, max: 800 }),
            rows: faker.number.int({ min: 1, max: 6 }),
            fins: faker.helpers.arrayElement(FINS_TYPES),
            finsPitch: faker.helpers.arrayElement([10, 11, 12, 14]),
            tube: faker.helpers.arrayElement(TUBE_TYPES)
          }
        })

        // Create a component linked to the core
        await prisma.component.create({
          data: {
            name: `Core ${faker.string.alphanumeric(4).toUpperCase()}`,
            type: ComponentType.CORE,
            productId: product.id,
            coreId: core.id
          }
        })

        console.log(`  ➕ Added CORE component to product ${product.label}`)
      } else {
        // Create a collector
        const collector = await prisma.collector.create({
          data: {
            width: faker.number.int({ min: 100, max: 1500 }),
            height: faker.number.int({ min: 100, max: 1500 }),
            thickness: faker.number.int({ min: 5, max: 15 }),
            lowerHeight: faker.datatype.boolean()
              ? faker.number.int({ min: 100, max: 800 })
              : null,
            lowerWidth: faker.datatype.boolean()
              ? faker.number.int({ min: 100, max: 800 })
              : null,
            position: faker.helpers.arrayElement(POSITIONS),
            tightening: faker.helpers.arrayElement(TIGHTENING_TYPES),
            material: faker.helpers.arrayElement(MATERIALS),
            perforation: faker.helpers.arrayElement(PERFORATIONS),
            isTinned: faker.datatype.boolean()
          }
        })

        // Create a component linked to the collector
        await prisma.component.create({
          data: {
            name: `Collector ${faker.string.alphanumeric(4).toUpperCase()}`,
            type: ComponentType.COLLECTOR,
            productId: product.id,
            collectorId: collector.id
          }
        })

        console.log(
          `  ➕ Added COLLECTOR component to product ${product.label}`
        )
      }
    }
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
