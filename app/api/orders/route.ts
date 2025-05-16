import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import type { Attachment, OrderItem } from '@/lib/validations'
import { Item } from 'react-stately'
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
    console.log(OrderItems[0].Radiator.Core)
    console.log(OrderItems[0].Radiator.Collector)
    // Validate required fields
    if (!clientId) {
      return NextResponse.json(
        { message: 'Client ID is required' },
        { status: 400 }
      )
    }

    if (
      !Payment ||
      typeof Payment.price !== 'number' ||
      typeof Payment.deposit !== 'number'
    ) {
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
          amount: Payment.price,
          deposit: Payment.deposit,
          remaining: Payment.remaining || Payment.price - Payment.deposit,
          mode: Payment.mode,
          bank: ['Espèces', 'Cheque', 'À terme'].includes(Payment.mode)
            ? null
            : Payment.bank,
          iban: Payment.iban,
          depositor: Payment.depositor
        }
      })

      // Process each order item to ensure radiators exist
      const processedOrderItems = await Promise.all(
        OrderItems.map(async (item: OrderItem) => {
          let radiatorId = item.Radiator?.id || item.id
          const isExist = await tx.radiator.findUnique({
            where: { id: radiatorId }
          })
          // If we have radiator data but no existing radiator ID, or if we want to create a new radiator
          if (!isExist) {
            // Create the new radiator with its components
            const newRadiator = await tx.radiator.create({
              data: {
                id: radiatorId,
                label: item.Radiator.label || 'Custom Radiator',
                cooling: item.Radiator.cooling || 'water',
                category: item.Radiator.category || 'automotive',
                // connecting model if it exist only
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

            // Update the radiator ID for this item
            radiatorId = newRadiator.id
            await tx.radiatorComponent.create({
              data: {
                name: 'Faisceau',
                type: 'CORE',
                radiatorId,
                Core: {
                  create: {
                    height:
                      (item.Radiator.Core?.dimensions?.height as number) || 0,
                    width:
                      (item.Radiator.Core?.dimensions?.width as number) || 0,
                    rows: (item.Radiator.Core?.rows as number) || 1,
                    fins: (item.Radiator.Core?.fins as string) || 'Normale',
                    finsPitch: Number(item.Radiator.Core?.finsPitch),
                    tube: item.Radiator.Core?.tube as string
                  }
                }
              }
            })
            const collectorTemplate = await tx.collectorTemplate.create({
              data: {
                position: item.Radiator.Collector.position,
                tightening: item.Radiator.Collector.tightening,
                perforation: item.Radiator.Collector.perforation,
                isTinned: item.Radiator.Collector.isTinned
              }
            })
            await tx.radiatorComponent.create({
              data: {
                name: 'Collecteur Haut',
                type: 'COLLECTOR',
                radiatorId,
                Collector: {
                  create: {
                    width: item.Radiator.Collector?.dimensions1?.width,
                    height: item.Radiator.Collector?.dimensions1?.height,
                    thickness: item.Radiator.Collector?.dimensions1?.thickness,
                    type: 'TOP',
                    Template: {
                      connect: { id: collectorTemplate.id }
                    }
                  }
                }
              }
            })
            await tx.radiatorComponent.create({
              data: {
                name: 'Collecteur Bas',
                type: 'COLLECTOR',
                radiatorId,
                Collector: {
                  create: {
                    width: item.Radiator.Collector?.dimensions2?.width
                      ? item.Radiator.Collector?.dimensions2?.width
                      : item.Radiator.Collector?.dimensions1.width,
                    height: item.Radiator.Collector?.dimensions2?.height
                      ? item.Radiator.Collector?.dimensions2?.height
                      : item.Radiator.Collector?.dimensions1.height,
                    thickness: item.Radiator.Collector?.dimensions2?.thickness
                      ? item.Radiator.Collector?.dimensions2?.thickness
                      : item.Radiator.Collector?.dimensions1?.thickness,
                    type: 'BOTTOM',
                    Template: {
                      connect: { id: collectorTemplate.id }
                    }
                  }
                }
              }
            })
            console.log('Created new radiator with ID:', radiatorId)
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
          },
          Attachments: true,
          Payment: true,
          Client: true
        }
      })

      return createdOrder
    })

    console.log('Order created successfully:', result.id)
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
