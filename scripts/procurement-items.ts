import { PrismaClient } from '@prisma/client'
import { generateId } from '../helpers/id-generator'

const prisma = new PrismaClient()

const items = [
  {
    name: 'Steel Sheet 2mm',
    category: 'Matieres premieres',
    description: 'Steel sheet for fabrication and brackets',
    unit: 'sheet'
  },
  {
    name: 'Fastener Kit M6',
    category: 'Composants',
    description: 'Assorted M6 bolts and washers',
    unit: 'kit'
  },
  {
    name: 'Copper Tube 12mm',
    category: 'Matieres premieres',
    description: 'Copper tube for cooling circuits',
    unit: 'meter'
  },
  {
    name: 'Packaging Carton Medium',
    category: 'Emballage et expedition',
    description: 'Medium carton for shipping',
    unit: 'box'
  },
  {
    name: 'Rubber Gasket 25mm',
    category: 'Composants',
    description: 'Standard gasket for sealing',
    unit: 'piece'
  },
  {
    name: 'Aluminum Profile 40x40',
    category: 'Matieres premieres',
    description: 'Aluminum profile for frames',
    unit: 'meter'
  },
  {
    name: 'Protective Paint',
    category: 'Consommables de fabrication',
    description: 'Anti-corrosion coating',
    unit: 'liter'
  },
  {
    name: 'Electrical Harness',
    category: 'Composants',
    description: 'Basic harness for motor wiring',
    unit: 'set'
  }
]

async function main() {
  console.log('Seeding procurement items...')

  for (const item of items) {
    const existing = await prisma.procurementItem.findFirst({
      where: { name: item.name }
    })

    if (existing) {
      await prisma.procurementItem.update({
        where: { id: existing.id },
        data: {
          category: item.category,
          description: item.description,
          unit: item.unit,
          isActive: true
        }
      })
      console.log(`Updated: ${item.name}`)
      continue
    }

    await prisma.procurementItem.create({
      data: {
        name: item.name,
        sku: generateId('PI'),
        category: item.category,
        description: item.description,
        unit: item.unit,
        isActive: true
      }
    })
    console.log(`Created: ${item.name}`)
  }

  console.log('Seeding completed.')
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
