import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { UserRole } from '@/types'
import { userRoles } from '@/config/global'
import { checkIsOnDemandRevalidate } from 'next/dist/server/api-utils'
import { getUserRole } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { OrderItem } from '@/lib/validations'

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
                Models: {
                  include: { Family: { include: { Brand: true } } }
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

    if (orderItems && Array.isArray(orderItems)) {
      await prisma.$transaction(async (tx) => {
        for (const item of orderItems) {
          // check if order item exists
          const existingItem = item.id
            ? await tx.orderItem.findUnique({ where: { id: item.id } })
            : null
          if (existingItem) {
            // update the existing order item
            await tx.orderItem.update({
              where: { id: item.id },
              data: {
                note: item.note || {},
                description: item.description || {},
                modification: item.modification || {},
                packaging: item.packaging,
                fabrication: item.fabrication,
                isModified: item.isModified,
                quantity: item.quantity,
                type: item.type || undefined
              }
            })
          } else {
            // create a new item and add it if not exist
            let radiatorId = item.radiatorId
            let createdRadiator = null
            if (!radiatorId) {
              createdRadiator = await tx.radiator.create({
                data: {
                  id: item.id, // use the custom SKU as the id
                  label: item.label || item.id,
                  category: item.category || undefined,
                  cooling: item.cooling || undefined,
                  ...(item.Radiator?.Car?.id
                    ? {
                        Models: {
                          connect: {
                            id: item.Radiator.Car.id
                          }
                        }
                      }
                    : {})
                }
              })
              radiatorId = createdRadiator.id
            } else {
              const radiatorExists = await tx.radiator.findUnique({
                where: { id: radiatorId }
              })
              if (!radiatorExists) {
                createdRadiator = await tx.radiator.create({
                  data: {
                    id: radiatorId,
                    label: item.label || radiatorId,
                    category: item.category || undefined,
                    cooling: item.cooling || undefined,
                    ...(item.Radiator?.Car?.id
                      ? {
                          Models: {
                            connect: {
                              id: item.Radiator.Car.id
                            }
                          }
                        }
                      : {})
                  }
                })
                radiatorId = createdRadiator.id
              }
            }
            // If we created a new radiator, add its components
            if (createdRadiator) {
              if (item.Radiator?.Core) {
                await tx.component.create({
                  data: {
                    name: 'Faisceau',
                    type: 'CORE',
                    radiatorId,
                    Metadata: item.Radiator.Core
                  }
                })
              }
              const tubeDiameter =
                item.Core?.dimensions?.diameter ||
                item.Radiator?.Core?.dimensions?.diameter
              if (tubeDiameter) {
                await tx.component.create({
                  data: {
                    name: 'Tube',
                    type: 'TUBE',
                    radiatorId,
                    Metadata: { diameter: tubeDiameter }
                  }
                })
              }
              if (item.Radiator?.Collector) {
                await tx.component.create({
                  data: {
                    name: 'Collecteur Haut',
                    type: 'COLLECTOR',
                    radiatorId,
                    Metadata: {
                      ...item.Radiator.Collector,
                      type: 'TOP',
                      dimensions: item.Radiator.Collector.dimensions1
                    }
                  }
                })
                await tx.component.create({
                  data: {
                    name: 'Collecteur Bas',
                    type: 'COLLECTOR',
                    radiatorId,
                    Metadata: {
                      ...item.Radiator.Collector,
                      type: 'BOTTOM',
                      dimensions:
                        item.Radiator.Collector.dimensions2 ||
                        item.Radiator.Collector.dimensions1
                    }
                  }
                })
              }
            } else {
              const tubeDiameter =
                item.Core?.dimensions?.diameter ||
                item.Radiator?.Core?.dimensions?.diameter
              if (tubeDiameter) {
                await tx.component.create({
                  data: {
                    name: 'Tube',
                    type: 'TUBE',
                    radiatorId,
                    Metadata: { diameter: tubeDiameter }
                  }
                })
              }
            }
            await tx.orderItem.create({
              data: {
                id: item.id, // allow custom id (sku)
                note: item.note || {},
                description: item.description || {},
                modification: item.modification || {},
                packaging: item.packaging,
                fabrication: item.fabrication,
                isModified: item.isModified,
                quantity: item.quantity,
                radiatorId: radiatorId,
                orderId: id,
                type: item.type || undefined
              }
            })
          }
        }
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
                Models: { include: { Family: { include: { Brand: true } } } }
              }
            },
            Attachments: true
          }
        },
        Attachments: true
      }
    })
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const { searchParams } = new URL(request.url)
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
      await prisma.orderItem.delete({ where: { id: itemId } })
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
    const body = await request.json()

    console.log('BODY:', body)

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
    let orderId = null
    // Use a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Update the order item
      const updatedOrderItem = await tx.orderItem.update({
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
            //
            validatedAt: new Date().toLocaleString()
          })
        }
      })

      orderId = updatedOrderItem.orderId

      // Update the parent order's itemsCount if quantity is updated
      if (typeof quantity === 'number') {
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
          data: { itemsCount: newItemsCount }
        })
      }

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
    // Revalidate the path
    if (orderId) revalidatePath(`/orders/${orderId}`)
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
