import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        Client: true,
        Payment: true,
        OrdersItems: {
          include: {
            Radiator: {
              include: {
                Components: {
                  include: {
                    Collector: true,
                    Core: true,
                    Materials: true
                  }
                }
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
    return NextResponse.json(order)
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
    const { deadline, state, progress, payment, orderItems, attachments } = body

    // Update payment if provided
    if (payment) {
      await prisma.payment.update({
        where: { id: existingOrder.paymentId },
        data: {
          amount: payment.amount,
          deposit: payment.deposit,
          remaining: payment.remaining || payment.amount - payment.deposit
        }
      })
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        deadline: deadline ? new Date(deadline) : undefined,
        state,
        progress
      },
      include: {
        Client: true,
        Payment: true,
        OrdersItems: true,
        Attachments: true
      }
    })

    // Update order items if provided
    if (orderItems && Array.isArray(orderItems)) {
      // Handle updates for existing items and creation of new items
      for (const item of orderItems) {
        if (item.id) {
          // Update existing item
          await prisma.orderItem.update({
            where: { id: item.id },
            data: {
              note: item.note || {},
              description: item.description || {},
              modification: item.modification || {},
              packaging: item.packaging,
              fabrication: item.fabrication,
              isModified: item.isModified
            }
          })
        } else {
          // Create new item
          await prisma.orderItem.create({
            data: {
              note: item.note || {},
              description: item.description || {},
              modification: item.modification || {},
              packaging: item.packaging,
              fabrication: item.fabrication,
              isModified: item.isModified,
              radiatorId: item.radiatorId,
              orderId: id
            }
          })
        }
      }
    }

    // Add new attachments if provided
    if (attachments && Array.isArray(attachments)) {
      for (const attachment of attachments) {
        if (!attachment.id) {
          await prisma.attachment.create({
            data: {
              url: attachment.url,
              type: attachment.type || 'unknown',
              name: attachment.name,
              uniqueName: attachment.uniqueName,
              orderId: id
            }
          })
        }
      }
    }

    return NextResponse.json(updatedOrder)
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

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

    return NextResponse.json({ message: 'Order deleted successfully' })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'An error occurred while deleting the order'
      },
      { status: 500 }
    )
  }
}
