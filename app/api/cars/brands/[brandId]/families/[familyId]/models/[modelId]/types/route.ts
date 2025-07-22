import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET all types for a model
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
      }
    })

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    const types = await prisma.type.findMany({
      where: {
        modelId: params.modelId
      }
    })
    return NextResponse.json(types)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch types' },
      { status: 500 }
    )
  }
}

// POST create a new type for a model
export async function POST(
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
      }
    })

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    const json = await request.json()
    const type = await prisma.type.create({
      data: {
        name: json.name,
        modelId: params.modelId
      }
    })
    return NextResponse.json(type, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create type' },
      { status: 500 }
    )
  }
}
