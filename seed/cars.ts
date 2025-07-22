import { skuId } from '../lib/utils'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface BrandModelData {
  model: string
  brand: string
}

let counter = 1

async function main() {
  console.log('🌱 Starting simple seeding: Brand → Family, Model → Type...')

  try {
    // Read the JSON file
    const jsonPath = path.join(process.cwd(), 'seed', 'data', 'cars.json')
    const jsonData = fs.readFileSync(jsonPath, 'utf-8')
    const brandModelData: BrandModelData[] = JSON.parse(jsonData)

    console.log(`📄 Found ${brandModelData.length} brand-model combinations`)

    // Clean up existing data
    console.log('🧹 Cleaning up existing data...')
    await prisma.type.deleteMany()
    await prisma.model.deleteMany()
    await prisma.family.deleteMany()
    await prisma.brand.deleteMany()

    // Group models by brand
    const brandGroups = brandModelData.reduce((acc, item) => {
      const brandName = item.brand.trim()
      if (!acc[brandName]) {
        acc[brandName] = []
      }
      // Avoid duplicate models for the same brand
      if (!acc[brandName].includes(item.model.trim())) {
        acc[brandName].push(item.model.trim())
      }
      return acc
    }, {} as Record<string, string[]>)

    console.log(`🏭 Found ${Object.keys(brandGroups).length} unique brands`)

    let totalModelsCreated = 0
    let totalFamiliesCreated = 0
    let totalBrandsCreated = 0
    let totalTypesCreated = 0

    // Process each brand
    for (const [brandName, models] of Object.entries(brandGroups)) {
      try {
        // Create the brand
        const brand = await prisma.brand.create({
          data: {
            name: brandName
          }
        })
        totalBrandsCreated++
        console.log(`✅ Created brand: ${brand.name}`)

        // Create family with same name as brand
        const family = await prisma.family.create({
          data: {
            name: brandName, // Copy brand name to family name
            brandId: brand.id
          }
        })
        totalFamiliesCreated++
        console.log(`  ➕ Created family: ${family.name}`)

        // Create models and types using the original model names
        for (const originalModelName of models) {
          try {
            // Create model with original model name
            const model = await prisma.model.create({
              data: {
                id: skuId('MO'),
                name: originalModelName, // Copy model name to model name
                familyId: family.id
              }
            })
            totalModelsCreated++
            console.log(`🚗 Created model: ${model.name}`)

            // Create type with same name as model
            await prisma.type.create({
              data: {
                name: originalModelName, // Copy model name to type name
                modelId: model.id
              }
            })
            totalTypesCreated++
            console.log(`      🔧 Created type: ${originalModelName}`)
          } catch (error) {
            console.warn(
              `⚠️  Could not create model/type ${originalModelName}:`,
              error
            )
            continue
          }
        }
      } catch (brandError) {
        console.error(`❌ Error processing brand ${brandName}:`, brandError)
        continue
      }
    }

    console.log(`✨ Simple seeding completed successfully!`)
    console.log(`📊 Summary:`)
    console.log(`   - Brands created: ${totalBrandsCreated}`)
    console.log(`   - Families created: ${totalFamiliesCreated}`)
    console.log(`   - Models created: ${totalModelsCreated}`)
    console.log(`   - Types created: ${totalTypesCreated}`)
  } catch (error) {
    console.error('❌ Error reading or parsing models-with-brands.json:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
