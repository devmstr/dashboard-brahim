import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const search = searchParams.get('search')?.trim().toLowerCase() || ''

    const skip = (page - 1) * limit

    const [radiators, total] = await Promise.all([
      prisma.radiator.findMany({
        where: {
          label: { contains: search, mode: 'insensitive' },
          isActive: true
        },
        include: {
          Inventory: true,
          Price: true
        },
        skip,
        take: limit
      }),
      prisma.radiator.count({
        where: {
          isActive: true
        }
      })
    ])

    const products = radiators.map((r) => ({
      id: r.id,
      reference: r.partNumber,
      label: r.label,
      price: r.Price?.unit ?? 0,
      priceTTC: r.Price?.unitTTC ?? 0,
      bulkPrice: r.Price?.bulk,
      bulkPriceTTC: r.Price?.bulkTTC,
      stockLevel: r.Inventory?.level ?? 0,
      minStockLevel: r.Inventory?.alertAt ?? 0,
      maxStockLevel: r.Inventory?.maxLevel ?? 0,
      isActive: r.isActive
    }))

    return NextResponse.json({
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 500 }
    )
  }
}
