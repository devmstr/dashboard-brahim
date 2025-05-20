import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

interface AlgerianCity {
  post_code: string
  post_name_ascii: string
  post_name: string
  post_address_ascii: string
  post_address: string
  commune_id: number
  commune_name_ascii: string
  commune_name: string
  daira_name_ascii: string
  daira_name: string
  wilaya_code: string
  wilaya_name_ascii: string
  wilaya_name: string
}

async function main() {
  console.log('🔄 Starting location seeding process...')

  const filePath = path.join(__dirname, 'data', 'algeria_postcodes.json')
  const rawData = await fs.readFile(filePath, 'utf-8')
  const cities: AlgerianCity[] = JSON.parse(rawData)

  console.log(`📊 Loaded ${cities.length} cities from data file`)

  // Use a transaction to ensure data consistency
  await prisma.$transaction(async (tx) => {
    // Clean up existing data
    console.log('🧹 Removing old location data...')
    await tx.city.deleteMany()
    await tx.province.deleteMany()
    await tx.country.deleteMany()
    console.log('✅ Old locations removed')

    // Step 1: Create Algeria as a Country
    console.log('🌍 Creating country record for Algeria...')
    const algeria = await tx.country.create({
      data: {
        code: 'DZ',
        name: 'Algeria'
      }
    })
    console.log(`✅ Created country: ${algeria.name} (${algeria.code})`)

    // Step 2: Group cities by wilaya (province)
    console.log('🗺️ Processing provinces and cities...')
    const wilayaMap = new Map<
      string,
      {
        code: string
        name: string
        name_ar: string
        cities: Map<number, AlgerianCity>
      }
    >()

    // Group by wilaya and deduplicate cities by commune_id
    for (const city of cities) {
      const wilayaCode = city.wilaya_code

      if (!wilayaMap.has(wilayaCode)) {
        wilayaMap.set(wilayaCode, {
          code: wilayaCode,
          name: city.wilaya_name_ascii,
          name_ar: city.wilaya_name,
          cities: new Map()
        })
      }

      // Only add the city if it's not already in the map (deduplicate by commune_id)
      const cityMap = wilayaMap.get(wilayaCode)!.cities
      if (!cityMap.has(city.commune_id)) {
        cityMap.set(city.commune_id, city)
      }
    }

    console.log(`📊 Processed ${wilayaMap.size} provinces`)

    // Step 3: Insert Provinces
    const provinces = []
    for (const [wilayaCode, wilaya] of wilayaMap) {
      const province = await tx.province.create({
        data: {
          code: wilaya.code,
          name: wilaya.name,
          nameAr: wilaya.name_ar,
          countryId: algeria.id
        }
      })
      provinces.push({ province, wilaya })
    }
    console.log(`✅ Created ${provinces.length} provinces`)

    // Step 4: Insert Cities in batches for each province
    let totalCities = 0
    for (const { province, wilaya } of provinces) {
      const citiesToCreate = Array.from(wilaya.cities.values()).map((city) => ({
        zipCode: city.post_code,
        name: city.commune_name_ascii,
        nameAr: city.commune_name,
        provinceId: province.id
      }))

      // Create cities in batches of 100
      const batchSize = 100
      for (let i = 0; i < citiesToCreate.length; i += batchSize) {
        const batch = citiesToCreate.slice(i, i + batchSize)
        await tx.city.createMany({
          data: batch
        })
      }

      totalCities += citiesToCreate.length
      console.log(
        `✅ Created ${citiesToCreate.length} cities for ${province.name}`
      )
    }

    console.log(
      `🎉 Successfully seeded 1 country, ${provinces.length} provinces, and ${totalCities} cities`
    )
  })
}

main()
  .catch((e) => {
    console.error('❌ Error seeding locations:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('✅ Database connection closed')
  })
