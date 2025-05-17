import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

const mockSkuId = (
  prefix: 'RA' | 'FA' | 'AU' | 'CO' | 'CB' | 'CL' | 'VE' | 'PA'
) => `${prefix}X${faker.string.alphanumeric(6).toUpperCase()}`

interface Dimensions {
  width: number
  height: number
  lowerWidth?: number
  lowerHeight?: number
}

interface ProductConfig {
  type?: 'Faisceau' | 'Radiateur'
  fabrication?: 'Renovation' | 'Confection'
  core: Dimensions
  rows?: number
  fins?: 'Z' | 'A' | 'D'
  tube?: '7' | '9' | 'M'
  pitch?: 10 | 11 | 12 | 14
  collector: Dimensions
  tightening?: 'P' | 'B'
  position?: 'C' | 'D'
}

function pad(n: number): string {
  return n.toString().padStart(4, '0')
}

function formatDimension(main: number, lower?: number): string {
  return lower && lower !== main ? `${pad(main)}/${pad(lower)}` : pad(main)
}

function formatProductPrefix(type: string, fabrication: string): string {
  if (type === 'Faisceau') return 'FAI'
  return fabrication === 'Confection' ? 'RAD' : 'REN'
}

export function generateProductTitle({
  type = 'Radiateur',
  fabrication = 'Confection',
  core,
  collector,
  rows = 1,
  fins = 'D',
  tube = '7',
  pitch: finsPitch = 10,
  tightening = 'P',
  position = 'C'
}: ProductConfig): string {
  const coreCode = `${pad(core.height)}X${pad(core.width)}`
  const rowsPart = (rows > 1 && rows.toString()) || ''
  const rowFinsTubeCode = `${rowsPart}${fins}${tube}`
  const collectorCode = `${formatDimension(
    collector.height,
    collector.lowerHeight
  )}X${formatDimension(collector.width, collector.lowerWidth)}`

  return `${formatProductPrefix(
    type,
    fabrication
  )} ${coreCode} ${rowFinsTubeCode} ${finsPitch} ${collectorCode} ${tightening}${position}`
}

// Constants for the seeding script
const TYPES = ['Radiateur', 'Faisceau']
const CATEGORIES = ['Automobile', 'Industriel', 'Générateurs', 'Agricole']
const COOLING_TYPES = ['Eau', 'Air', 'Huile']
const POSITIONS = [, 'Centrer', 'Dépassée']
const TIGHTENING_TYPES = ['Plié', 'Boulonné']
const MATERIALS = ['Acier', 'Laiton']
const PERFORATION = ['Perforé', 'Non Perforé']
export const FINS_TYPES = ['Zigzag', 'Aérer', 'Normale']
const TUBE_TYPES = ['ET7', 'ET9', 'MP']
const FINS_PITCHES = [10, 11, 12, 14]

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean up existing data if needed
  await prisma.materialUsage.deleteMany()
  await prisma.component.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.radiator.deleteMany()

  console.log('🧹 Cleaned up existing data')

  // Create 10 products with components
  for (let i = 0; i < 10; i++) {
    const type = faker.helpers.arrayElement(TYPES)
    const id = mockSkuId(type === 'Faisceau' ? 'FA' : 'RA')
    const category = faker.helpers.arrayElement(CATEGORIES)
    const productReference = `${id}`

    // Generate core dimensions
    const coreWidth = faker.number.int({ min: 100, max: 800 })
    const coreHeight = faker.number.int({ min: 100, max: 800 })

    // Generate collector dimensions
    const collectorWidth = faker.number.int({ min: 100, max: 1500 })
    const collectorHeight = faker.number.int({ min: 100, max: 1500 })

    // Generate other properties
    const rows = faker.number.int({ min: 1, max: 6 })
    const fins = faker.helpers.arrayElement(FINS_TYPES)
    const tube = faker.helpers.arrayElement(TUBE_TYPES)
    const finsPitch = faker.helpers.arrayElement(FINS_PITCHES)
    const tightening = faker.helpers.arrayElement(TIGHTENING_TYPES)
    const position = faker.helpers.arrayElement(POSITIONS)

    // Generate product title using the utility function
    const productLabel = generateProductTitle({
      type: type === 'Faisceau' ? 'Faisceau' : 'Radiateur',
      core: {
        width: coreWidth,
        height: coreHeight
      },
      collector: {
        width: collectorWidth,
        height: collectorHeight
      },
      rows,
      fins: fins[0] as any,
      tube: tube.startsWith('M') ? 'M' : (tube[tube.length - 1] as any),
      pitch: finsPitch as any,
      tightening: tightening[0] as any,
      position: position?.at(0) as any
    })

    // Create the product
    const radiator = await prisma.radiator.create({
      data: {
        id: id,
        reference: productReference,
        label: productLabel,
        category,
        dir: `C${faker.string.numeric(3)}`,
        cooling: faker.helpers.arrayElement(COOLING_TYPES),
        barcode: faker.string.numeric(13),
        isActive: true
      }
    })

    console.log(`✅ Created product: ${radiator.label} - ${productLabel}`)

    // Create a core component
    await prisma.component.create({
      data: {
        name: `Core ${faker.string.alphanumeric(4).toUpperCase()}`,
        type: 'CORE',
        radiatorId: radiator.id,
        MetaDate: {
          width: coreWidth,
          height: coreHeight,
          rows,
          fins,
          finsPitch,
          tube
        }
      }
    })

    console.log(`  ➕ Added CORE component to product ${radiator.label}`)

    // Create TOP collector component
    await prisma.component.create({
      data: {
        name: `Collector TOP ${faker.string.alphanumeric(4).toUpperCase()}`,
        type: 'COLLECTOR',
        radiatorId: radiator.id,
        MetaDate: {
          width: collectorWidth,
          height: collectorHeight,
          thickness: faker.number.int({ min: 5, max: 15 }),
          type: 'TOP',
          position,
          tightening,
          perforation: faker.helpers.arrayElement(PERFORATION),
          isTinned: faker.datatype.boolean()
        }
      }
    })

    console.log(
      `  ➕ Added TOP COLLECTOR component to product ${radiator.label}`
    )

    // Create BOTTOM collector component
    await prisma.component.create({
      data: {
        name: `Collector BOTTOM ${faker.string.alphanumeric(4).toUpperCase()}`,
        type: 'COLLECTOR',
        radiatorId: radiator.id,
        MetaDate: {
          width: collectorWidth,
          height: collectorHeight,
          thickness: faker.number.int({ min: 5, max: 15 }),
          type: 'BOTTOM',
          position,
          tightening,
          perforation: faker.helpers.arrayElement(PERFORATION),
          isTinned: faker.datatype.boolean()
        }
      }
    })

    console.log(
      `  ➕ Added BOTTOM COLLECTOR component to product ${radiator.label}`
    )
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
