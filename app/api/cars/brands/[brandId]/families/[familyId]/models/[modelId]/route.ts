import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET a single model by ID within a family
export async function GET(
  request: NextRequest,
  { params }: { params: { brandId: string; familyId: string; modelId: string } }
) {
  try {
    // First check if the model exists and belongs to the family
    const model = await prisma.carModel.findFirst({
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
    const existingModel = await prisma.carModel.findFirst({
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
    const updatedModel = await prisma.carModel.update({
      where: {
        id: params.modelId
      },
      data: {
        name: json.name,
        year: json.production,
        radiatorId: json.radiatorId
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

// DELETE a model within a family
export async function DELETE(
  request: NextRequest,
  { params }: { params: { brandId: string; familyId: string; modelId: string } }
) {
  try {
    // First check if the model exists and belongs to the family
    const existingModel = await prisma.carModel.findFirst({
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

    await prisma.carModel.delete({
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
