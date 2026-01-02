import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const services = [
  'Chaudronnerie',
  'Tournage',
  'Fraisage',
  'Assemblage',
  'Brasage',
  'Soudage',
  'Fabrication du noyau',
  'Test d etancheite',
  'Controle qualite',
  'Maintenance',
  'Planification de la production',
  'Magasin'
]

async function main() {
  console.log('Seeding procurement services...')

  for (const name of services) {
    await prisma.procurementService.upsert({
      where: { name },
      update: { isActive: true },
      create: { name, isActive: true }
    })
    console.log(`Upserted: ${name}`)
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
