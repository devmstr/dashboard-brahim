import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET a single family by ID within a brand
export async function GET(
  request: NextRequest,
  { params }: { params: { brandId: string; familyId: string } }
) {
  try {
    console.log('familyId: ', params.familyId, 'brandId: ', params.brandId)
    const family = await prisma.carFamily.findFirst({
      where: {
        id: params.familyId,
        brandId: params.brandId
      },
      include: {
        models: true
      }
    })

    if (!family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 })
    }

    return NextResponse.json(family)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch family' },
      { status: 500 }
    )
  }
}

// PUT update a family within a brand
export async function PUT(
  request: NextRequest,
  { params }: { params: { brandId: string; familyId: string } }
) {
  try {
    // First check if the family exists and belongs to the brand
    const existingFamily = await prisma.carFamily.findFirst({
      where: {
        id: params.familyId,
        brandId: params.brandId
      }
    })

    if (!existingFamily) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 })
    }

    const json = await request.json()
    const updatedFamily = await prisma.carFamily.update({
      where: {
        id: params.familyId
      },
      data: {
        name: json.name
      }
    })
    return NextResponse.json(updatedFamily)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update family' },
      { status: 500 }
    )
  }
}

// DELETE a family within a brand
export async function DELETE(
  request: NextRequest,
  { params }: { params: { brandId: string; familyId: string } }
) {
  try {
    // First check if the family exists and belongs to the brand
    const existingFamily = await prisma.carFamily.findFirst({
      where: {
        id: params.familyId,
        brandId: params.brandId
      }
    })

    if (!existingFamily) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 })
    }

    await prisma.carFamily.delete({
      where: {
        id: params.familyId
      }
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete family' },
      { status: 500 }
    )
  }
}
