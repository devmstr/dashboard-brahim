import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const provinceId = searchParams.get('province')
  const provinceCode = searchParams.get('provinceCode')

  try {
    let cities

    if (provinceId) {
      // Get cities by province ID
      cities = await prisma.city.findMany({
        where: { provinceId },
        orderBy: { name: 'asc' }
      })
    } else if (provinceCode) {
      // Get cities by province code
      const province = await prisma.province.findUnique({
        where: { code: provinceCode }
      })

      if (!province) {
        return NextResponse.json(
          { error: 'Province not found' },
          { status: 404 }
        )
      }

      cities = await prisma.city.findMany({
        where: { provinceId: province.id },
        orderBy: { name: 'asc' }
      })
    } else {
      // Return error if no province specified
      return NextResponse.json(
        { error: 'Province ID or code is required' },
        { status: 400 }
      )
    }

    return NextResponse.json(cities)
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    )
  }
}
