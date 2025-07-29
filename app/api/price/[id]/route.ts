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
    const radiator = await prisma.radiator.update({
      where: { id },
      data: {
        Price: {
          upsert: {
            create: {
              unit: price,
              unitTTC: priceTTC,
              bulk: bulkPrice,
              bulkTTC: bulkPriceTTC,
              bulkThreshold: bulkPriceThreshold
            },
            update: {
              unit: price,
              unitTTC: priceTTC,
              bulk: bulkPrice,
              bulkTTC: bulkPriceTTC,
              bulkThreshold: bulkPriceThreshold
            }
          }
        }
      },
      include: { Price: true }
    })

    // revalidate the path
    revalidatePath(`/dashboard/inventory/${id}`)
    return NextResponse.json({
      message: 'Price updated',
      price: radiator.Price?.unit
    })
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 500 }
    )
  }
}
