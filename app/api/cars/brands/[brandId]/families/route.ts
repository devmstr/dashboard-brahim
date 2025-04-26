import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET all families for a brand
export async function GET(
  request: NextRequest,
  { params }: { params: { brandId: string } }
) {
  try {
    // First check if the brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: params.brandId }
    })

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    const families = await prisma.carFamily.findMany({
      where: {
        brandId: params.brandId
      },
      include: {
        models: true
      }
    })
    return NextResponse.json(families)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch families' },
      { status: 500 }
    )
  }
}

// POST create a new family for a brand
export async function POST(
  request: NextRequest,
  { params }: { params: { brandId: string } }
) {
  try {
    // First check if the brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: params.brandId }
    })

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    const json = await request.json()
    const family = await prisma.carFamily.create({
      data: {
        name: json.name,
        brandId: params.brandId
      }
    })
    return NextResponse.json(family, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create family' },
      { status: 500 }
    )
  }
}
