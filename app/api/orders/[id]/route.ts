import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { UserRole } from '@/types'
import { userRoles } from '@/config/global'
import { checkIsOnDemandRevalidate } from 'next/dist/server/api-utils'
import { getUserRole } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { OrderItem } from '@/lib/procurement/validations'
import { includes } from 'lodash'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    let order = await prisma.order.findUnique({
      where: { id },
      include: {
        Client: true,
        Payment: true,
        OrdersItems: {
          include: {
            CarType: {
              include: {
                Model: { include: { Family: { include: { Brand: true } } } }
              }
            },
            Attachments: true
          }
        },
        Attachments: true
      }
    })

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    }
    const { OrdersItems, ...orderData } = order
    return NextResponse.json({
      ...orderData,
      OrdersItems: OrdersItems.map((orderItem) => ({
        ...orderItem
      }))
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'An error occurred while fetching the order'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await request.json()

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    })

    if (!existingOrder) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    }

    // Extract data from the request body
    const {
      deadline,
      state,
      progress,
      payment,
      orderItems,
      attachments,
      deliveredItems
    } = body as {
      deadline?: string
      state?: string
      progress?: number
      payment?: any
      orderItems: OrderItem[]
      attachments?: any[]
      deliveredItems?: any[]
    }

    // Update payment if provided
    if (payment) {
      await prisma.payment.update({
        where: { id: existingOrder.paymentId },
        data: {
          amount: payment.price,
          deposit: payment.deposit,
          remaining: payment.remaining || payment.price - payment.deposit,
          mode: payment.mode || null,
          bank: payment.bank || null,
          iban: payment.iban || null,
          depositor: payment.depositor || null
        }
      })
    }

    // Prepare update data for the order
    const updateData: any = {
      deadline: deadline ? new Date(deadline) : undefined,
      state,
      progress
    }

    // Update order
    await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        Client: true,
        Payment: true,
        OrdersItems: {
          include: {
            CarType: {
              include: {
                Model: { include: { Family: { include: { Brand: true } } } }
              }
            },
            Attachments: true
          }
        },
        Attachments: true
      }
    })

    if (orderItems && Array.isArray(orderItems)) {
      await prisma.$transaction(async (tx) => {
        for (const item of orderItems) {
          const existingItem = item.id
            ? await tx.orderItem.findUnique({ where: { id: item.id } })
            : null
          if (existingItem) {
            await tx.orderItem.update({
              where: { id: item.id },
              data: {
                note: item.note || undefined,
                description: item.description || undefined,
                modification: item.modification || undefined,
                packaging: item.packaging || undefined,
                fabrication: item.fabrication || undefined,
                isModified: item.isModified ?? false,
                quantity: item.quantity ?? 1,
                type: item.type || undefined,
                betweenCollectors: item.betweenCollectors ?? null,
                category: item.category || 'Automobile',
                cooling: item.cooling ?? null,
                isTinned: item.isTinned ?? false,
                isPainted: item.isPainted ?? false,
                fins: item.fins ?? null,
                perforation: item.perforation ?? null,
                position: item.position ?? null,
                pitch: item.pitch ? Number(item.pitch) : null,
                tubeDiameter: item.tubeDiameter ?? null,
                tubeType: item.tubeType ?? null,
                rows: item.rows ?? null,
                width: item.width ?? null,
                upperCollectorLength: item.upperCollectorLength ?? null,
                lowerCollectorLength: item.lowerCollectorLength ?? null,
                upperCollectorWidth: item.upperCollectorWidth ?? null,
                lowerCollectorWidth: item.lowerCollectorWidth ?? null,
                tightening: item.tightening ?? null,
                label: item.label,
                status: item.status || 'Prévu',
                delivered: existingItem.delivered ?? 0,
                carTypeId: item.CarType?.id
              }
            })
          } else {
            await tx.orderItem.create({
              data: {
                id: item.id,
                note: item.note || undefined,
                description: item.description || undefined,
                modification: item.modification || undefined,
                packaging: item.packaging || undefined,
                fabrication: item.fabrication || undefined,
                isModified: item.isModified ?? false,
                quantity: item.quantity ?? 1,
                type: item.type || undefined,
                betweenCollectors: item.betweenCollectors ?? null,
                category: item.category || 'Automobile',
                cooling: item.cooling ?? null,
                isTinned: item.isTinned ?? false,
                isPainted: item.isPainted ?? false,
                fins: item.fins ?? null,
                perforation: item.perforation ?? null,
                position: item.position ?? null,
                pitch: item.pitch ? Number(item.pitch) : null,
                tubeDiameter: item.tubeDiameter ?? null,
                tubeType: item.tubeType ?? null,
                rows: item.rows ?? null,
                width: item.width ?? null,
                upperCollectorLength: item.upperCollectorLength ?? null,
                lowerCollectorLength: item.lowerCollectorLength ?? null,
                upperCollectorWidth: item.upperCollectorWidth ?? null,
                lowerCollectorWidth: item.lowerCollectorWidth ?? null,
                tightening: item.tightening ?? null,
                label: item.label,
                status: item.status || 'Prévu',
                delivered: 0,
                orderId: id,
                carTypeId: item.CarType?.id
              }
            })
          }
        }
        // After all items are added/updated, recalculate totalItems
        const allItems = await tx.orderItem.findMany({ where: { orderId: id } })
        const newItemsCount = allItems.reduce(
          (sum, item) => sum + (item.quantity || 1),
          0
        )
        await tx.order.update({
          where: { id },
          data: { totalItems: newItemsCount }
        })
      })
    }

    // Refetch the updated order with all items
    const updatedOrderWithItems = await prisma.order.findUnique({
      where: { id },
      include: {
        Client: true,
        Payment: true,
        OrdersItems: {
          include: {
            Attachments: true,
            CarType: {
              include: {
                Model: { include: { Family: { include: { Brand: true } } } }
              }
            }
          }
        },
        Attachments: true
      }
    })
    revalidatePath(`/dashboard/orders/${id}`)
    return NextResponse.json(updatedOrderWithItems)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'An error occurred while updating the order'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const { searchParams } = request.nextUrl
    const itemId = searchParams.get('itemId')

    if (itemId) {
      // Delete a single order item
      const existingItem = await prisma.orderItem.findUnique({
        where: { id: itemId }
      })
      if (!existingItem) {
        return NextResponse.json(
          { message: 'Order item not found' },
          { status: 404 }
        )
      }
      const orderId = existingItem.orderId
      await prisma.orderItem.delete({ where: { id: itemId } })
      // Recalculate totalItems after deletion
      if (orderId) {
        const allItems = await prisma.orderItem.findMany({ where: { orderId } })
        const newItemsCount = allItems.reduce(
          (sum, item) => sum + (item.quantity || 1),
          0
        )
        await prisma.order.update({
          where: { id: orderId },
          data: { totalItems: newItemsCount }
        })
      }
      return NextResponse.json({ message: 'Order item deleted successfully' })
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    })

    if (!existingOrder) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    }

    // Delete order (this will cascade delete related items due to the schema)
    await prisma.order.delete({
      where: { id }
    })

    // Revalidate the path to ensure the cache is updated
    revalidatePath(`/dashboard/orders/${id}`)

    return NextResponse.json({ message: 'Order deleted successfully' })
  } catch (error) {
    console.error('Error deleting order or order item:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'An error occurred while deleting the order or order item'
      },
      { status: 500 }
    )
  }
}

// Add this to your route.ts file alongside the existing POST and GET handlers

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const role = await getUserRole()

    if (!role)
      return NextResponse.json(
        { message: 'UnAuthorized Action' },
        { status: 404 }
      )

    if (
      role &&
      ![
        'ENGINEER',
        'ENGINEERING_MANAGER',
        'SALES_AGENT',
        'SALES_MANAGER'
      ].includes(role)
    ) {
      return NextResponse.json(
        { message: 'Not Allowed action' },
        { status: 404 }
      )
    }

    const isAuthorizedForValidation = [
      'ENGINEER',
      'ENGINEERING_MANAGER'
    ].includes(role)

    const id = params.id
    const body = (await request.json()) as OrderItem

    // Validate that the order item exists
    const existingItem = await prisma.orderItem.findUnique({
      where: { id },
      include: {
        Attachments: true,
        CarType: {
          include: {
            Model: { include: { Family: { include: { Brand: true } } } }
          }
        }
      }
    })

    if (!existingItem) {
      return NextResponse.json(
        { message: 'Order item not found' },
        { status: 404 }
      )
    }

    if (existingItem.validatedAt)
      return NextResponse.json(
        { message: 'Les commandes validées ne peuvent pas être modifiées.' },
        { status: 404 }
      )

    // Use a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Update the order item
      const updatedOrderItem = await tx.orderItem.update({
        where: { id },
        data: {
          note: body.note || undefined,
          description: body.description || undefined,
          modification: body.modification || undefined,
          packaging: body.packaging || undefined,
          fabrication: body.fabrication || undefined,
          isModified: body.isModified ?? false,
          quantity: body.quantity ?? 1,
          type: body.type || undefined,
          betweenCollectors: body.betweenCollectors ?? null,
          category: body.category || 'Automobile',
          cooling: body.cooling ?? null,
          isTinned: body.isTinned ?? false,
          isPainted: body.isPainted ?? false,
          fins: body.fins ?? null,
          perforation: body.perforation ?? null,
          position: body.position ?? null,
          pitch: body.pitch ? Number(body.pitch) : null,
          tubeDiameter: body.tubeDiameter ?? null,
          tubeType: body.tubeType ?? null,
          rows: body.rows ?? null,
          width: body.width ?? null,
          upperCollectorLength: body.upperCollectorLength ?? null,
          lowerCollectorLength: body.lowerCollectorLength ?? null,
          upperCollectorWidth: body.upperCollectorWidth ?? null,
          lowerCollectorWidth: body.lowerCollectorWidth ?? null,
          tightening: body.tightening ?? null,
          label: body.label,
          status: body.status || 'Prévu',
          delivered: existingItem.delivered ?? 0,
          carTypeId: body.CarType?.id,
          ...(isAuthorizedForValidation && {
            validatedAt: new Date().toLocaleString()
          })
        }
      })

      // Update the parent order's totalItems if quantity is updated
      if (typeof body.quantity === 'number') {
        // Find all items for this order
        const allItems = await tx.orderItem.findMany({
          where: { orderId: updatedOrderItem.orderId }
        })
        // TODO: check if the allItem.length - quantity is less then the deliveredItems number

        const newItemsCount = allItems.reduce(
          (sum, item) => sum + (item.quantity || 1),
          0
        )
        await tx.order.update({
          where: { id: updatedOrderItem.orderId || undefined },
          data: { totalItems: newItemsCount }
        })
      }

      // Fetch the updated order item with all related data
      return await tx.orderItem.findUnique({
        where: { id },
        include: {
          Attachments: true,
          CarType: {
            include: {
              Model: {
                include: {
                  Family: { include: { Brand: true } }
                }
              }
            }
          }
        }
      })
    })
    // Revalidate the path
    revalidatePath(`/dashboard/orders/${id}`)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating order item:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'An error occurred while updating the order item'
      },
      { status: 500 }
    )
  }
}
