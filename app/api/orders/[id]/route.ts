import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { UserRole } from '@/types'
import { userRoles } from '@/config/global'
import { checkIsOnDemandRevalidate } from 'next/dist/server/api-utils'
import { getUserRole } from '@/lib/session'

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
                    MaterialUsages: {
                      include: {
                        Material: true
                      }
                    }
                  }
                },
                Price: true,
                Models: true
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
    const {
      deadline,
      state,
      progress,
      payment,
      orderItems,
      attachments,
      deliveredItems
    } = body

    // Update payment if provided
    if (payment) {
      await prisma.payment.update({
        where: { id: existingOrder.paymentId },
        data: {
          amount: payment.price, // Fix: use payment.price instead of payment.amount
          deposit: payment.deposit,
          remaining: payment.remaining || payment.price - payment.deposit,
          mode: payment.mode || null,
          bank: payment.bank || null,
          iban: payment.iban || null,
          depositor: payment.depositor || null
        }
      })
    }

    // Update order items delivery state if deliveredItems is provided
    if (typeof deliveredItems === 'number') {
      // Fetch all order items for this order, sorted by creation (or id)
      const items = await prisma.orderItem.findMany({
        where: { orderId: id },
        orderBy: { id: 'asc' } // or use createdAt if available
      })
      let toDeliver = deliveredItems
      let deliveredSum = 0
      let totalSum = 0
      for (const item of items) {
        totalSum += item.quantity || 1
        // If there are still items to deliver, set state to 'delivered'
        if (toDeliver > 0) {
          await prisma.orderItem.update({
            where: { id: item.id },
            data: { state: 'delivered' }
          })
          deliveredSum += item.quantity || 1
          toDeliver -= item.quantity || 1
        } else {
          // Mark as not delivered (pending or previous state)
          await prisma.orderItem.update({
            where: { id: item.id },
            data: { state: 'pending' }
          })
        }
      }
      // Update the Order's itemsCount and deliveredItems fields
      await prisma.order.update({
        where: { id },
        data: {
          itemsCount: totalSum,
          deliveredItems: deliveredSum
        }
      })
    }

    // Prepare update data for the order
    const updateData: any = {
      deadline: deadline ? new Date(deadline) : undefined,
      state,
      progress
    }
    // If deliveredItems is provided, update itemsCount and deliveredItems
    if (typeof deliveredItems === 'number') {
      // Fetch all order items for this order
      const items = await prisma.orderItem.findMany({
        where: { orderId: id }
      })
      let totalSum = 0
      let deliveredSum = 0
      let toDeliver = deliveredItems
      for (const item of items) {
        totalSum += item.quantity || 1
        if (toDeliver > 0) {
          deliveredSum += item.quantity || 1
          toDeliver -= item.quantity || 1
        }
      }
      updateData.itemsCount = totalSum
      updateData.deliveredItems = deliveredSum
    }
    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        Client: true,
        Payment: true,
        OrdersItems: {
          include: {
            Radiator: {
              include: {
                Components: {
                  include: {
                    MaterialUsages: {
                      include: {
                        Material: true
                      }
                    }
                  }
                },
                Price: true,
                Models: true
              }
            }
          }
        },
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
    const body = await request.json()

    // console.log('body : ', body)

    // Validate that the order item exists
    const existingItem = await prisma.orderItem.findUnique({
      where: { id },
      include: {
        Radiator: {
          include: {
            Components: {
              include: {
                MaterialUsages: {
                  include: {
                    Material: true
                  }
                }
              }
            },
            Price: true,
            Models: true
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
        { message: 'Order is already validated' },
        { status: 404 }
      )

    // Extract data from the request body
    const {
      type,
      note,
      description,
      modification,
      packaging,
      fabrication,
      isModified,
      quantity,
      Radiator
    } = body

    // Use a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Update the order item
      const updatedItem = await tx.orderItem.update({
        where: { id },
        data: {
          type: type,
          note: note || undefined,
          description: description || undefined,
          modification: modification || undefined,
          packaging: packaging,
          fabrication: fabrication,
          isModified: isModified,
          quantity: quantity,
          ...(isAuthorizedForValidation && {
            validatedAt: new Date().toLocaleString()
          })
        }
      })

      // If radiator data is provided, update the radiator and its components
      if (Radiator) {
        const radiatorId = Radiator.id || existingItem.radiatorId

        // Update the radiator
        await tx.radiator.update({
          where: { id: radiatorId },
          data: {
            label: Radiator.label,
            cooling: Radiator.cooling,
            category: Radiator.category,
            ...(Radiator.Car?.id
              ? {
                  Models: {
                    connect: {
                      id: Radiator.Car.id
                    }
                  }
                }
              : {})
          }
        })

        // Update Core component if provided (now as Component with type 'CORE')
        if (Radiator.Core) {
          const coreComponent = await tx.component.findFirst({
            where: {
              radiatorId,
              type: 'CORE'
            }
          })
          if (coreComponent) {
            await tx.component.update({
              where: { id: coreComponent.id },
              data: {
                Metadata: Radiator.Core
              }
            })
          }
        }

        // Update Collector components if provided (now as Component with type 'COLLECTOR')
        if (Radiator.Collector) {
          // TOP collector
          const topCollector = await tx.component.findFirst({
            where: {
              radiatorId,
              type: 'COLLECTOR',
              Metadata: {
                path: ['type'],
                equals: 'TOP'
              }
            }
          })
          if (topCollector) {
            await tx.component.update({
              where: { id: topCollector.id },
              data: {
                Metadata: {
                  ...Radiator.Collector,
                  type: 'TOP',
                  dimensions: Radiator.Collector.dimensions1
                }
              }
            })
          }
          // BOTTOM collector
          const bottomCollector = await tx.component.findFirst({
            where: {
              radiatorId,
              type: 'COLLECTOR',
              Metadata: {
                path: ['type'],
                equals: 'BOTTOM'
              }
            }
          })
          if (bottomCollector) {
            await tx.component.update({
              where: { id: bottomCollector.id },
              data: {
                Metadata: {
                  ...Radiator.Collector,
                  type: 'BOTTOM',
                  dimensions:
                    Radiator.Collector.dimensions2 ||
                    Radiator.Collector.dimensions1
                }
              }
            })
          }
        }
      }

      // Fetch the updated order item with all related data
      return await tx.orderItem.findUnique({
        where: { id },
        include: {
          Radiator: {
            include: {
              Components: {
                include: {
                  MaterialUsages: {
                    include: {
                      Material: true
                    }
                  }
                }
              },
              Price: true,
              Models: true
            }
          }
        }
      })
    })

    console.log('Order item updated successfully:', result?.id)

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
