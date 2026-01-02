import { PrismaClient } from '@prisma/client'
import { generateId } from '../helpers/id-generator'

const prisma = new PrismaClient()

const suppliers = [
  {
    name: 'Atlas Metals',
    code: generateId('PO'),
    category: 'Matieres premieres',
    contactName: 'Karim A.',
    email: 'contact@atlasmetals.dz',
    phone: '+213 21 45 67 10',
    website: 'https://atlasmetals.dz'
  },
  {
    name: 'Sahara Industrial',
    code: generateId('PO'),
    category: 'Composants',
    contactName: 'Nadia B.',
    email: 'sales@sahara-industrial.com',
    phone: '+213 23 11 02 55',
    website: 'https://sahara-industrial.com'
  },
  {
    name: 'Mediterranée Supplies',
    code: generateId('PO'),
    category: 'Consommables de fabrication',
    contactName: 'Hassan M.',
    email: 'info@medsupplies.dz',
    phone: '+213 24 30 18 44',
    website: 'https://medsupplies.dz'
  },
  {
    name: 'NordTech Equipements',
    code: generateId('PO'),
    category: 'Outillage et equipements',
    contactName: 'Leila S.',
    email: 'support@nordtech.dz',
    phone: '+213 25 58 92 10',
    website: 'https://nordtech.dz'
  },
  {
    name: 'Oran Logistics',
    code: generateId('PO'),
    category: 'Emballage et expedition',
    contactName: 'Yacine K.',
    email: 'orders@oran-logistics.com',
    phone: '+213 41 22 11 90',
    website: 'https://oran-logistics.com'
  }
]

async function main() {
  console.log('Seeding procurement suppliers...')

  for (const supplier of suppliers) {
    const existing = await prisma.procurementSupplier.findFirst({
      where: { name: supplier.name }
    })

    if (existing) {
      await prisma.procurementSupplier.update({
        where: { id: existing.id },
        data: {
          category: supplier.category,
          contactName: supplier.contactName,
          email: supplier.email,
          phone: supplier.phone,
          website: supplier.website
        }
      })
      console.log(`Updated: ${supplier.name}`)
      continue
    }

    await prisma.procurementSupplier.create({
      data: supplier
    })
    console.log(`Created: ${supplier.name}`)
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
