import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET a single type by ID within a model
export async function GET(
  request: NextRequest,
  {
    params
  }: {
    params: {
      brandId: string
      familyId: string
      modelId: string
      typeId: string
    }
  }
) {
  try {
    // First check if the type exists and belongs to the model
    const type = await prisma.type.findFirst({
      where: {
        id: params.typeId,
        modelId: params.modelId,
        Model: {
          familyId: params.familyId,
          Family: {
            brandId: params.brandId
          }
        }
      }
    })

    if (!type) {
      return NextResponse.json({ error: 'Type not found' }, { status: 404 })
    }

    return NextResponse.json(type)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch type' }, { status: 500 })
  }
}

// PUT update a type within a model
export async function PUT(
  request: NextRequest,
  {
    params
  }: {
    params: {
      brandId: string
      familyId: string
      modelId: string
      typeId: string
    }
  }
) {
  try {
    // First check if the type exists and belongs to the model
    const existingType = await prisma.type.findFirst({
      where: {
        id: params.typeId,
        modelId: params.modelId,
        Model: {
          familyId: params.familyId,
          Family: {
            brandId: params.brandId
          }
        }
      }
    })

    if (!existingType) {
      return NextResponse.json({ error: 'Type not found' }, { status: 404 })
    }

    const json = await request.json()
    const updatedType = await prisma.type.update({
      where: {
        id: params.typeId
      },
      data: {
        name: json.name,
        year: json.production,
        fuel: json.fuel,
        radiatorId: json.radiatorId
      }
    })
    return NextResponse.json(updatedType)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update type' },
      { status: 500 }
    )
  }
}

// DELETE a type within a model
export async function DELETE(
  request: NextRequest,
  {
    params
  }: {
    params: {
      brandId: string
      familyId: string
      modelId: string
      typeId: string
    }
  }
) {
  try {
    // First check if the type exists and belongs to the model
    console.log('HiT...........')
    const existingType = await prisma.type.findFirst({
      where: {
        id: params.typeId
      }
    })

    if (!existingType) {
      return NextResponse.json({ error: 'Type not found' }, { status: 404 })
    }

    await prisma.type.delete({
      where: {
        id: params.typeId
      }
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete type' },
      { status: 500 }
    )
  }
}
