import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET all models for a family
export async function GET(
  request: NextRequest,
  { params }: { params: { brandId: string; familyId: string } }
) {
  try {
    // First check if the family exists and belongs to the brand
    const family = await prisma.carFamily.findFirst({
      where: {
        id: params.familyId,
        brandId: params.brandId
      }
    })

    if (!family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 })
    }

    const models = await prisma.carModel.findMany({
      where: {
        familyId: params.familyId
      },
      include: {
        Types: true
      }
    })
    return NextResponse.json(models)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
}

// POST create a new model for a family
export async function POST(
  request: NextRequest,
  { params }: { params: { brandId: string; familyId: string } }
) {
  try {
    // First check if the family exists and belongs to the brand
    const family = await prisma.carFamily.findFirst({
      where: {
        id: params.familyId,
        brandId: params.brandId
      }
    })

    if (!family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 })
    }

    const json = await request.json()
    const model = await prisma.carModel.create({
      data: {
        name: json.name,
        production: json.production,
        familyId: params.familyId,
        productId: json.productId,
      }
    })
    return NextResponse.json(model, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create model' },
      { status: 500 }
    )
  }
}
