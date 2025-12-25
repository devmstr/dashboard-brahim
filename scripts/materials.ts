import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting to seed materials...')
  console.log('Delete old Materials...')
  await prisma.rawMaterial.deleteMany()
  console.log('Materials Deleted with sucess!')
   
  const baseUnit = {
    connectOrCreate: {
      where: { code: 'KG' as const },
      create: {
        name: 'kilograme',
        code: 'KG' as const,
        category: 'WEIGHT' as const
      }
    }
  }

  // Array of materials to seed
  const materials = [
    {
      reference: 'TUBL30',
      name: 'Tube En Laiton Ø 30',
      description:
        'Tube en laiton de diamètre 30mm, utilisé pour les radiateurs et installations de chauffage',
      unit: 'grammes',
      baseUnit,
      conversionFactor: 840, // e.g., 840g/m
      unitCost: 0.012 // €/g
    },
    {
      reference: 'TUBL32',
      name: 'Tube En Laiton Ø 32',
      description:
        'Tube en laiton de diamètre 32mm, utilisé pour les radiateurs et installations de chauffage',
      unit: 'grammes',
      baseUnit,
      conversionFactor: 920, // 920g/m
      unitCost: 0.012
    },
    {
      reference: 'TUBL35',
      name: 'Tube En Laiton Ø 35',
      description:
        'Tube en laiton de diamètre 35mm, utilisé pour les radiateurs et installations de chauffage',
      unit: 'grammes',
      baseUnit,
      conversionFactor: 1050, // 1050g/m
      unitCost: 0.012
    },
    {
      reference: 'BNL06',
      name: 'Band En Laiton Ø 6',
      description:
        'Bande en laiton de diamètre 6mm, utilisée pour les radiateurs et installations de chauffage',
      unit: 'grammes',
      baseUnit,
      conversionFactor: 150, // 150g/m
      unitCost: 0.012
    }
  ]

  // Create materials in the database
  for (const material of materials) {
    try {
      const createdMaterial = await prisma.rawMaterial.create({
        data: material
      })
      console.log(`Created material: ${createdMaterial.name}`)
    } catch (error) {
      console.error(`Error creating material ${material.name}:`, error)
    }
  }

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
