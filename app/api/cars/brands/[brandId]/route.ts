import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET a single brand by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { brandId: string } }
) {
  try {
    const brand = await prisma.brand.findUnique({
      where: {
        id: params.brandId
      },
      include: {
        Families: true
      }
    })

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    return NextResponse.json(brand)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch brand' },
      { status: 500 }
    )
  }
}

// PUT update a brand
export async function PUT(
  request: NextRequest,
  { params }: { params: { brandId: string } }
) {
  try {
    const json = await request.json()
    const updatedBrand = await prisma.brand.update({
      where: {
        id: params.brandId
      },
      data: {
        name: json.name
      }
    })
    return NextResponse.json(updatedBrand)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update brand' },
      { status: 500 }
    )
  }
}

// DELETE a brand
export async function DELETE(
  request: NextRequest,
  { params }: { params: { brandId: string } }
) {
  try {
    await prisma.brand.delete({
      where: {
        id: params.brandId
      }
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete brand' },
      { status: 500 }
    )
  }
}
