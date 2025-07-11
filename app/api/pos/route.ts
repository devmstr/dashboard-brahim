import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    // Get all radiators that have both inventory and price
    const radiators = await prisma.radiator.findMany({
      where: {
        // inventoryId: { not: null },
        // priceId: { not: null },
        isActive: true
      },
      include: {
        Inventory: true,
        Price: true
      }
    })
    // Map to POS product format
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
    return NextResponse.json(products)
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 500 }
    )
  }
}
