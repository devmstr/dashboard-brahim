import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import type { Attachment, OrderItem } from '@/lib/validations'
import { skuId } from '@/lib/utils'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Extract data from the request body
    const {
      id,
      clientId,
      deadline,
      state,
      progress,
      Payment,
      OrderItems,
      Attachments
    } = body
    // Remove old Core/Collector logic and use Components
    // Validate required fields
    if (!clientId) {
      return NextResponse.json(
        { message: 'Client ID is required' },
        { status: 400 }
      )
    }

    if (!Payment || typeof Payment.price !== 'number') {
      return NextResponse.json(
        { message: 'Valid payment information is required' },
        { status: 400 }
      )
    }

    if (!OrderItems || !Array.isArray(OrderItems) || OrderItems.length === 0) {
      return NextResponse.json(
        { message: 'At least one order item is required' },
        { status: 400 }
      )
    }

    // Use a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Create the payment record first
      const createdPayment = await tx.payment.create({
        data: {
          amount: Payment.price || 0,
          deposit: Payment.deposit || 0,
          remaining: Payment.remaining || Payment.price - Payment.deposit || 0,
          mode: Payment.mode || 'Espèces',
          bank: ['Espèces', 'Cheque', 'À terme'].includes(Payment.mode)
            ? null
            : Payment.bank,
          iban: Payment.iban || null,
          depositor: Payment.depositor || null
        }
      })

      // Process each order item to ensure radiators exist
      const processedOrderItems = await Promise.all(
        OrderItems.map(async (item: OrderItem) => {
          let radiatorId = item.Radiator?.id || item.id
          const isExist = await tx.radiator.findUnique({
            where: { id: radiatorId }
          })
          if (!isExist) {
            // Create the new radiator
            const newRadiator = await tx.radiator.create({
              data: {
                id: radiatorId,
                label: item.Radiator.label,
                cooling: item.Radiator.cooling,
                category: item.Radiator.category || 'automotive',
                ...(item.Radiator.Car?.id
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
            radiatorId = newRadiator.id

            // Create core component as a Component with type 'CORE'
            if (item.Radiator.Core) {
              await tx.component.create({
                data: {
                  name: 'Faisceau',
                  type: 'CORE',
                  radiatorId,
                  Metadata: item.Radiator.Core
                }
              })
            }

            // Create tube component as a Component with type 'TUBE' if diameter exists
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

            // Create collector components as Components with type 'COLLECTOR'
            if (item.Radiator.Collector) {
              // TOP collector
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
              // BOTTOM collector
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
            // If radiator exists, still add TUBE component if diameter exists
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
          // Return the processed order item with the correct radiator ID
          return {
            id: skuId('AR'),
            note: item.note || undefined,
            description: item.description || undefined,
            modification: item.modification || undefined,
            packaging: item.packaging || null,
            fabrication: item.fabrication || null,
            type: item.type,
            isModified: item.isModified || null,
            quantity: item.quantity || 1,
            radiatorId: radiatorId // Use the existing or newly created radiator ID
          }
        })
      )

      // Prepare attachments data if provided
      const attachmentsData =
        Attachments && Attachments.length > 0
          ? Attachments.map((attachment: Attachment) => ({
              url: attachment.url,
              type: attachment.type || 'unknown',
              name: attachment.name,
              uniqueName: attachment.uniqueName
            }))
          : []

      // Create the order with the payment ID and related items
      const createdOrder = await tx.order.create({
        data: {
          id,
          clientId,
          deadline: new Date(deadline).toISOString(),
          state: state || 'PENDING',
          progress: progress || 0,
          paymentId: createdPayment.id,
          itemsCount:
            OrderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0, // Set total items
          deliveredItems: body.deliveredItems ?? 0, // Set delivered items (default 0)

          // Create order items with processed radiator IDs
          OrdersItems: {
            createMany: {
              data: processedOrderItems
            }
          },

          // Create attachments if provided
          ...(attachmentsData.length > 0
            ? {
                Attachments: {
                  create: attachmentsData
                }
              }
            : {})
        },
        include: {
          OrdersItems: {
            include: {
              Radiator: {
                include: {
                  Components: true,
                  Price: true,
                  Models: true
                }
              }
            }
          },
          Attachments: true,
          Payment: true,
          Client: true
        }
      })

      return createdOrder
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'An error occurred while creating the order'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const limit = Number.parseInt(searchParams.get('limit') || '10')
    const page = Number.parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    const where = clientId ? { clientId } : {}

    const orders = await prisma.order.findMany({
      where,
      include: {
        Client: true,
        Payment: true,
        OrdersItems: {
          include: {
            Radiator: {
              include: {
                Components: true,
                Price: true,
                Models: true
              }
            }
          }
        },
        Attachments: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    const total = await prisma.order.count({ where })

    return NextResponse.json({
      data: orders,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'An error occurred while fetching orders'
      },
      { status: 500 }
    )
  }
}
