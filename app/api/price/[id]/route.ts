import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  if (!['SALES_AGENT', 'SALES_MANAGER'].includes(user.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  const id = params.id
  const body = await request.json()
  // Map new fields
  const {
    price, // unit
    priceTTC, // unitTTC
    bulkPrice, // bulk
    bulkPriceTTC, // bulkTTC
    bulkPriceThreshold, // bulkThreshold
    isActive
  } = body

  try {
    // Find the radiator
    const radiator = await prisma.radiator.findUnique({
      where: { id },
      include: { Price: true }
    })
    if (!radiator) {
      return NextResponse.json(
        { message: 'Radiator not found' },
        { status: 404 }
      )
    }
    let priceId = radiator.priceId
    // If radiator has no price, create one
    if (!priceId) {
      const newPrice = await prisma.price.create({
        data: {
          unit: price ?? 0,
          unitTTC: priceTTC ?? 0,
          bulk: bulkPrice ?? 0,
          bulkTTC: bulkPriceTTC ?? 0,
          bulkThreshold: bulkPriceThreshold ?? 0,
          Radiators: { connect: { id } }
        }
      })
      await prisma.radiator.update({
        where: { id },
        data: { priceId: newPrice.id }
      })
      return NextResponse.json({ message: 'Price created', price: newPrice })
    } else {
      // Update existing price
      const updatedPrice = await prisma.price.update({
        where: { id: priceId },
        data: {
          ...(price !== undefined ? { unit: price } : {}),
          ...(priceTTC !== undefined ? { unitTTC: priceTTC } : {}),
          ...(bulkPrice !== undefined ? { bulk: bulkPrice } : {}),
          ...(bulkPriceTTC !== undefined ? { bulkTTC: bulkPriceTTC } : {}),
          ...(bulkPriceThreshold !== undefined
            ? { bulkThreshold: bulkPriceThreshold }
            : {})
        }
      })
      // revalidate the path
      revalidatePath(`/dashboard/inventory/${id}`)
      return NextResponse.json({
        message: 'Price updated',
        price: updatedPrice
      })
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 500 }
    )
  }
}
