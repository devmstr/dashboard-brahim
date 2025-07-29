import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { partial } from 'lodash'
import { InventoryType } from '@/app/dashboard/inventory/schema.zod'

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
    const body = (await request.json()) as Partial<InventoryType>
    const { stockLevel, minStockLevel, maxStockLevel, isActive } = body

    // Find the radiator and its inventory
    const radiator = await prisma.radiator.update({
      where: { id: radiatorId },
      data: {
        Inventory: {
          upsert: {
            create: {
              level: stockLevel ?? 0,
              alertAt: minStockLevel ?? 0,
              maxLevel: maxStockLevel ?? 0
            },
            update: {
              level: stockLevel ?? 0,
              alertAt: minStockLevel ?? 0,
              maxLevel: maxStockLevel ?? 0
            }
          }
        }
      },
      include: { Inventory: true }
    })

    revalidatePath('/dashboard/inventory')
    return NextResponse.json({
      message: 'Inventory updated',
      inventory: radiator.Inventory
    })
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
