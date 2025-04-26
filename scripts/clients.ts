import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

let counter = 1

function skuId() {
  return `CLX${String(counter++).padStart(4, '0')}`
}

async function seedClients() {
  console.log('🧹 Cleaning up old clients...')
  await prisma.client.deleteMany()

  console.log('🔍 Fetching location data from database...')

  // Get provinces from Algeria
  const provinces = await prisma.province.findMany({
    where: {
      country: {
        code: 'DZ'
      }
    },
    take: 6 // Limit to 6 provinces
  })

  if (provinces.length === 0) {
    throw new Error(
      'No provinces found for Algeria. Please seed provinces first.'
    )
  }

  // Get cities for these provinces
  const cities = await prisma.city.findMany({
    where: { provinceId: { in: provinces.map((p) => p.id) } },
    take: 10 // Limit to 10 cities
  })

  if (cities.length === 0) {
    throw new Error(
      'No cities found for the provinces. Please seed cities first.'
    )
  }

  console.log('🌱 Creating clients with addresses...')

  // Create clients with proper relations
  const clientsToCreate = Array.from({ length: 10 }).map(async () => {
    // Select random province and city that belongs to that province
    const randomProvince = faker.helpers.arrayElement(provinces)
    const provinceCities = cities.filter(
      (city) => city.provinceId === randomProvince.id
    )
    const randomCity =
      provinceCities.length > 0
        ? faker.helpers.arrayElement(provinceCities)
        : faker.helpers.arrayElement(cities) // Fallback if no cities for province

    // Create address first
    const address = await prisma.address.create({
      data: {
        street: faker.location.streetAddress(),
        country: { connect: { code: 'DZ' } },
        province: { connect: { id: randomProvince.id } },
        city: { connect: { id: randomCity.id } }
      }
    })

    // Create client with address relation
    return prisma.client.create({
      data: {
        id: skuId(),
        name: faker.company.name(),
        phone: `+213${faker.string.numeric(9)}`,
        label: faker.company.catchPhrase(),
        email: faker.internet.email(),
        isCompany: true,
        website: faker.internet.url(),
        tradeRegisterNumber: faker.string.alphanumeric(10).toUpperCase(), // RC
        fiscalNumber: faker.string.alphanumeric(10).toUpperCase(), // MF
        registrationArticle: faker.string.alphanumeric(8).toUpperCase(), // AI
        taxIdNumber: faker.string.numeric(15), // NIF
        statisticalIdNumber: faker.string.numeric(15), // NIS
        approvalNumber: faker.string.alphanumeric(10).toUpperCase(), // NA
        address: { connect: { id: address.id } }
      }
    })
  })

  // Execute all client creations
  await Promise.all(clientsToCreate)

  console.log('✅ Clients seeded successfully!')
}

seedClients()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
