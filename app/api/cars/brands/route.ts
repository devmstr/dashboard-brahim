import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET all brands
export async function GET(request: NextRequest) {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        Families: true
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
