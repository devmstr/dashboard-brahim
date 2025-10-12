import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { partial } from 'lodash'
import { StockFormType } from '@/app/dashboard/inventory/_schema.zod'

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
    const body = (await request.json()) as StockFormType
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
    revalidatePath('/dashboard/inventory')
    return NextResponse.json({ message: 'Inventory updated', inventory })
  } catch (error) {
    console.error('Error updating inventory:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Get the radiator with inventory
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

    if (!radiator.inventoryId) {
      return NextResponse.json(
        { message: 'No inventory to delete' },
        { status: 400 }
      )
    }

    // Optional: Delete the inventory record completely
    await prisma.inventory.delete({
      where: { id: radiator.inventoryId }
    })

    // Unlink inventory from radiator
    await prisma.radiator.update({
      where: { id: radiatorId },
      data: {
        inventoryId: null
      }
    })

    revalidatePath('/dashboard/inventory')

    return NextResponse.json({ message: 'Inventory deleted successfully' })
  } catch (error) {
    console.error('Error deleting inventory:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
