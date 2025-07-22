import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { skuId } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const json = (await request.json()) as {
      brand: string
      model: string
      family: string
      types: {
        name: string
        fuel: string
        year: string
      }[]
    }

    const { brand, family, model, types } = json

    // 1. Create or find the brand
    let brandRecord = await prisma.brand.findUnique({
      where: { name: brand }
    })

    if (!brandRecord) {
      brandRecord = await prisma.brand.create({
        data: { name: brand }
      })
    }

    // 2. Create or find the family under the brand
    let familyRecord = await prisma.family.findFirst({
      where: {
        name: family,
        brandId: brandRecord.id
      }
    })

    if (!familyRecord) {
      familyRecord = await prisma.family.create({
        data: {
          name: family,
          brandId: brandRecord.id
        }
      })
    }

    // 3. Create or find the model under the family
    let modelRecord = await prisma.model.findFirst({
      where: {
        name: model,
        familyId: familyRecord.id
      }
    })

    if (!modelRecord) {
      modelRecord = await prisma.model.create({
        data: {
          id: skuId('MO'),
          name: model,
          familyId: familyRecord.id
        }
      })
    }

    // 4. Loop through and create each type if it doesn't exist
    for (const type of types) {
      const existingType = await prisma.type.findFirst({
        where: {
          name: type.name,
          modelId: modelRecord.id
        }
      })

      if (!existingType) {
        await prisma.type.create({
          data: {
            id: skuId('VE'),
            name: type.name,
            year: type.year,
            fuel: type.fuel,
            modelId: modelRecord.id
          }
        })
      }
    }

    return NextResponse.json(
      { message: 'Car data saved successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to create car data' },
      { status: 500 }
    )
  }
}
