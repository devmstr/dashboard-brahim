import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { EditCarSchemaType } from '@/app/dashboard/cars/[id]/edit-car.form copy'
import { skuId } from '@/lib/utils'

// GET a single model by ID within a family
export async function GET(
  request: NextRequest,
  { params }: { params: { brandId: string; familyId: string; modelId: string } }
) {
  try {
    // First check if the model exists and belongs to the family
    const model = await prisma.model.findFirst({
      where: {
        id: params.modelId,
        familyId: params.familyId,
        Family: {
          brandId: params.brandId
        }
      },
      include: {
        Types: true
      }
    })

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    return NextResponse.json(model)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch model' },
      { status: 500 }
    )
  }
}

// PUT update a model within a family
export async function PUT(
  request: NextRequest,
  { params }: { params: { brandId: string; familyId: string; modelId: string } }
) {
  try {
    // First check if the model exists and belongs to the family
    const existingModel = await prisma.model.findFirst({
      where: {
        id: params.modelId,
        familyId: params.familyId,
        Family: {
          brandId: params.brandId
        }
      }
    })

    if (!existingModel) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    const json = await request.json()
    const updatedModel = await prisma.model.update({
      where: {
        id: params.modelId
      },
      data: {
        name: json.name
      }
    })
    return NextResponse.json(updatedModel)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update model' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { brandId: string; familyId: string; modelId: string } }
) {
  try {
    // Check if the model exists and belongs to the family and brand
    const existingModel = await prisma.model.findFirst({
      where: {
        id: params.modelId
      },
      include: {
        Types: true
      }
    })

    if (!existingModel) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    const json = (await request.json()) as EditCarSchemaType

    // Normalize types
    const newTypes = json.types || []

    // Existing types in DB
    const existingTypes = existingModel.Types

    // Get list of types to delete
    const existingTypeKeys = existingTypes.map(
      (type) => `${type.name}-${type.year}-${type.fuel}`
    )
    const incomingTypeKeys = newTypes.map(
      (t) => `${t.name}-${t.year}-${t.fuel}`
    )

    const typesToDelete = existingTypes.filter(
      (type) =>
        !incomingTypeKeys.includes(`${type.name}-${type.year}-${type.fuel}`)
    )

    // Delete removed types
    for (const type of typesToDelete) {
      await prisma.type.delete({ where: { id: type.id } })
    }

    // Upsert incoming types
    for (const type of newTypes) {
      await prisma.type.upsert({
        where: {
          // We'll try to find by unique combination; otherwise fallback to `id`
          id:
            existingTypes.find(
              (t) =>
                t.name === type.name &&
                t.year === type.year &&
                t.fuel === type.fuel
            )?.id || ''
        },
        update: {
          name: type.name || '',
          year: type.year || '',
          fuel: type.fuel || ''
        },
        create: {
          id: skuId('VE'),
          name: type.name || '',
          year: type.year || '',
          fuel: type.fuel || '',
          modelId: existingModel.id
        }
      })
    }

    // Update the model name (and optionally family/brand if allowed)
    const updatedModel = await prisma.model.update({
      where: { id: params.modelId },
      data: {
        name: json.model || existingModel.name,
        Family: {
          update: {
            Brand: {
              update: {
                name: json.brand
              }
            },
            name: json.family
          }
        }
      },
      include: {
        Types: true
      }
    })

    return NextResponse.json(updatedModel)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to update model' },
      { status: 500 }
    )
  }
}

// DELETE a model within a family
export async function DELETE(
  request: NextRequest,
  { params }: { params: { brandId: string; familyId: string; modelId: string } }
) {
  try {
    // First check if the model exists and belongs to the family
    const existingModel = await prisma.model.findFirst({
      where: {
        id: params.modelId,
        familyId: params.familyId,
        Family: {
          brandId: params.brandId
        }
      }
    })

    if (!existingModel) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    await prisma.model.delete({
      where: {
        id: params.modelId
      }
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete model' },
      { status: 500 }
    )
  }
}
