import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { NewCarSchemaType } from '@/app/dashboard/cars/new-car.form'
import { getUserRole } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { skuId } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const cars = await prisma.carModel.findMany({
      include: {
        Types: true,
        Family: {
          include: {
            Brand: true
          }
        }
      }
    })
    if (!cars)
      return NextResponse.json({ error: 'No car was found.' }, { status: 404 })
    const data = cars.map(
      ({ Family, Types, familyId, radiatorId, ...car }) => ({
        ...car,
        brand: Family?.Brand?.name,
        brandId: Family?.brandId,
        familyId,
        family: Family?.name,
        type: Types[0]?.name,
        typeId: Types[0]?.id,
        radiatorId
      })
    )
    revalidatePath('/dashboard/cars')
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[POST /api/car]', error)
    return NextResponse.json(
      { error: 'Failed to create car model.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const role = await getUserRole()
  if (role && !['CONSULTANT', 'ENGINEER', 'ENGINEERING_MANAGER'].includes(role))
    return NextResponse.json({ error: 'Not Authorized' }, { status: 402 })
  try {
    const json = (await request.json()) as NewCarSchemaType
    console.log('router data : ', json)
    const { id: requestId, brand, family, model, type, year, fuel } = json

    if (!brand || !family || !model) {
      return NextResponse.json(
        { error: 'Brand, family, and model are required.' },
        { status: 400 }
      )
    }

    // 1. Get or create the brand
    let brandRecord = await prisma.brand.findFirst({
      where: { name: brand }
    })

    if (!brandRecord) {
      brandRecord = await prisma.brand.create({
        data: { name: brand }
      })
    }

    // 2. Get or create the family under the brand
    let familyRecord = await prisma.carFamily.findFirst({
      where: {
        name: family,
        brandId: brandRecord.id
      }
    })

    if (!familyRecord) {
      familyRecord = await prisma.carFamily.create({
        data: {
          name: family,
          Brand: {
            connect: { id: brandRecord.id }
          }
        }
      })
    }
    const id = requestId || skuId('MO')
    // 3. Create the car model under the family
    const carModel = await prisma.carModel.create({
      data: {
        id,
        name: model,
        year: year || null,
        fuel: fuel || null,
        Family: {
          connect: { id: familyRecord.id }
        },
        ...(type && {
          Types: {
            create: {
              name: type
            }
          }
        })
      }
    })
    revalidatePath('/dashboard/cars')
    return NextResponse.json(carModel, { status: 201 })
  } catch (error) {
    console.error('[POST /api/car]', error)
    return NextResponse.json(
      { error: 'Failed to create car model.' },
      { status: 500 }
    )
  }
}
