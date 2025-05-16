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
                Collector: true,
                Core: true
              }
            }
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
            // Update model if it exists
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

        // Update Core component if provided
        if (Radiator.Core) {
          // Find the core component
          const coreComponent = await tx.radiatorComponent.findFirst({
            where: {
              radiatorId,
              type: 'CORE'
            },
            include: {
              Core: true
            }
          })

          if (coreComponent && coreComponent.Core) {
            // Update the core
            await tx.core.update({
              where: { id: coreComponent.Core.id },
              data: {
                height: Radiator.Core.dimensions?.height as number,
                width: Radiator.Core.dimensions?.width as number,
                rows: Radiator.Core.rows as number,
                fins: Radiator.Core.fins as string,
                finsPitch: Number(Radiator.Core.finsPitch),
                tube: Radiator.Core.tube as string
              }
            })
          }
        }

        // Update Collector components if provided
        if (Radiator.Collector) {
          // Find collector template
          const collectorComponent = await tx.radiatorComponent.findFirst({
            where: {
              radiatorId,
              type: 'COLLECTOR'
            },
            include: {
              Collector: {
                include: {
                  Template: true
                }
              }
            }
          })

          if (collectorComponent?.Collector?.Template) {
            const templateId = collectorComponent.Collector.Template.id

            // Update collector template
            await tx.collectorTemplate.update({
              where: { id: templateId },
              data: {
                position: Radiator.Collector.position,
                tightening: Radiator.Collector.tightening,
                perforation: Radiator.Collector.perforation,
                isTinned: Radiator.Collector.isTinned
              }
            })
          }

          // Update top collector
          const topCollector = await tx.radiatorComponent.findFirst({
            where: {
              radiatorId,
              type: 'COLLECTOR',
              Collector: {
                type: 'TOP'
              }
            },
            include: {
              Collector: true
            }
          })

          if (topCollector && topCollector.Collector) {
            await tx.collector.update({
              where: { id: topCollector.Collector.id },
              data: {
                width: Radiator.Collector.dimensions1?.width,
                height: Radiator.Collector.dimensions1?.height,
                thickness: Radiator.Collector.dimensions1?.thickness
              }
            })
          }

          // Update bottom collector
          const bottomCollector = await tx.radiatorComponent.findFirst({
            where: {
              radiatorId,
              type: 'COLLECTOR',
              Collector: {
                type: 'BOTTOM'
              }
            },
            include: {
              Collector: true
            }
          })

          if (bottomCollector && bottomCollector.Collector) {
            await tx.collector.update({
              where: { id: bottomCollector.Collector.id },
              data: {
                width:
                  Radiator.Collector.dimensions2?.width ||
                  Radiator.Collector.dimensions1?.width,
                height:
                  Radiator.Collector.dimensions2?.height ||
                  Radiator.Collector.dimensions1?.height,
                thickness:
                  Radiator.Collector.dimensions2?.thickness ||
                  Radiator.Collector.dimensions1?.thickness
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
                  Collector: true,
                  Core: true
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
