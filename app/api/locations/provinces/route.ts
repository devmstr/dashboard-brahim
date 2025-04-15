import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const countryName = searchParams.get('country')

  try {
    let provinces

    if (countryName) {
      // Get provinces by country code
      const country = await prisma.country.findUnique({
        where: { code: countryName }
      })

      if (!country) {
        return NextResponse.json(
          { error: 'Country not found' },
          { status: 404 }
        )
      }

      provinces = await prisma.province.findMany({
        where: { countryId: country.id },
        orderBy: { name: 'asc' }
      })
    } else {
      // Get all provinces if no country specified
      provinces = await prisma.province.findMany({
        orderBy: { name: 'asc' }
      })
    }

    return NextResponse.json(provinces)
  } catch (error) {
    console.error('Error fetching provinces:', error)
    return NextResponse.json(
      { error: 'Failed to fetch provinces' },
      { status: 500 }
    )
  }
}
