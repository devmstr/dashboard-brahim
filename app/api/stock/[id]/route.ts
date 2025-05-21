import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

// PATCH: Update inventory for a radiator
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (!['INVENTORY_AGENT'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const radiatorId = params.id
    const body = await request.json()
    const { stockLevel, minStockLevel, maxStockLevel, isActive } = body

    // Find the radiator and its inventory
    const radiator = await prisma.radiator.findUnique({
      where: { id: radiatorId },
      include: { Inventory: true }
    })

    if (!radiator) {
      return NextResponse.json(
        { message: 'Radiator not found' },
        { status: 404 }
      )
    }

    let inventory
    if (!radiator.inventoryId) {
      // Create new inventory and link to radiator
      inventory = await prisma.inventory.create({
        data: {
          level: stockLevel ?? 0,
          alertAt: minStockLevel ?? 0,
          maxLevel: maxStockLevel ?? 0,
          Radiators: { connect: { id: radiatorId } }
        }
      })
      await prisma.radiator.update({
        where: { id: radiatorId },
        data: {
          inventoryId: inventory.id,
          isActive: isActive ?? radiator.isActive
        }
      })
    } else {
      // Update existing inventory
      inventory = await prisma.inventory.update({
        where: { id: radiator.inventoryId },
        data: {
          level: stockLevel ?? undefined,
          alertAt: minStockLevel ?? undefined,
          maxLevel: maxStockLevel ?? undefined
        }
      })
      await prisma.radiator.update({
        where: { id: radiatorId },
        data: { isActive: isActive ?? radiator.isActive }
      })
    }

    return NextResponse.json({ message: 'Inventory updated', inventory })
  } catch (error) {
    console.error('Error updating inventory:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
