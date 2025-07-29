import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const search = searchParams.get('search')?.trim().toLowerCase() || ''

    const skip = (page - 1) * limit

    // Step 1: Get all inventories with related radiators
    const radiators = await prisma.radiator.findMany({
      where: {
        OR: [
          {
            label: { contains: search, mode: 'insensitive' }
          },
          {
            barcode: { contains: search, mode: 'insensitive' }
          }
        ]
      },
      include: {
        Price: true,
        Inventory: true
      }
    })

    // Step 2: Flatten and map all rows
    const allRows = radiators.map((rad) => ({
      id: rad.id,
      designation: rad.label || '',
      barcode: rad.barcode || '',
      quantity: rad.Inventory?.level,
      minLevel: rad.Inventory?.alertAt,
      maxLevel: rad.Inventory?.maxLevel,
      price: rad.Price?.unit ?? 0,
      priceTTC: rad.Price?.unitTTC ?? 0,
      bulkPrice: rad.Price?.bulk ?? 0,
      bulkPriceTTC: rad.Price?.bulkTTC ?? 0,
      bulkPriceThreshold: rad.Price?.bulkThreshold ?? null
    }))

    // Step 3: Filter if search is provided
    const filteredRows = search
      ? allRows.filter((row) => row.designation.toLowerCase().includes(search))
      : allRows

    // Step 4: Paginate filtered results
    const paginatedRows = filteredRows.slice(skip, skip + limit)

    return NextResponse.json({
      data: paginatedRows,
      meta: {
        total: filteredRows.length,
        page,
        limit,
        totalPages: Math.ceil(filteredRows.length / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching inventory data:', error)
    return NextResponse.json(
      { message: error.message || 'Server Error' },
      { status: 500 }
    )
  }
}
