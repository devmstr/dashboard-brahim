import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET all brands
export async function GET(request: NextRequest) {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        families: true
      }
    })
    return NextResponse.json(brands)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}

// POST create a new brand
export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const brand = await prisma.brand.create({
      data: {
        name: json.name
      }
    })
    return NextResponse.json(brand, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    )
  }
}
