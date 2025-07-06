import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import type { Attachment, Order, OrderItem } from '@/lib/validations'
import { skuId } from '@/lib/utils'
import { TypeOf } from 'zod'
import { STATUS_TYPES } from '@/config/global'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Order

    const {
      id,
      clientId,
      deadline,
      status,
      progress,
      Payment,
      OrderItems,
      Attachments
    } = body
    console.log('body : ', body)
    // Validate inputs
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

    if (!Array.isArray(OrderItems) || OrderItems.length === 0) {
      return NextResponse.json(
        { message: 'At least one order item is required' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Create payment
      const createdPayment = await tx.payment.create({
        data: {
          amount: Payment.price || 0,
          deposit: Payment.deposit || 0,
          remaining:
            Payment.price && Payment.deposit
              ? Payment.price - Payment.deposit
              : Payment.remaining || 0,
          mode: Payment.mode || 'Espèces',
          bank: ['Espèces', 'Cheque', 'À terme'].includes(Payment.mode)
            ? Payment.bank
            : null,
          iban: Payment.iban?.toString() || null,
          depositor: Payment.depositor || null,
          Client: { connect: { id: clientId } }
        }
      })

      // Step 2: Prepare attachments
      const attachmentsData = (Attachments || []).map((attachment) => ({
        url: attachment.url,
        type: attachment.type || 'unknown',
        name: attachment.name,
        uniqueName: attachment.uniqueName ?? ''
      }))

      // Step 3: Create order (needed before linking order items)
      const createdOrder = await tx.order.create({
        data: {
          id,
          clientId,
          deadline: deadline ?? new Date().toISOString(),
          status: (status as Order['status']) || 'Prévu',
          progress: progress || 0,
          paymentId: createdPayment.id,
          totalItems: OrderItems.reduce(
            (sum, item) => sum + (item.quantity || 1),
            0
          ),
          deliveredItems: 0,
          ...(attachmentsData.length > 0 && {
            Attachments: { create: attachmentsData }
          })
        }
      })

      // Step 4: Create order items
      for (const item of OrderItems) {
        await tx.orderItem.create({
          data: {
            id: skuId('AR'),
            note: item.note || undefined,
            description: item.description || undefined,
            modification: item.modification || undefined,
            packaging: item.packaging || undefined,
            fabrication: item.fabrication || undefined,
            type: item.type,
            isModified: item.isModified ?? false,
            quantity: item.quantity ?? 1,
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
            tube: item.tubeType ?? null,
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
            Order: { connect: { id: createdOrder.id } },
            ...(item.Vehicle?.id && {
              Model: { connect: { id: item.Vehicle.id } }
            })
          }
        })
      }

      // Step 5: Return the order with included relations
      const fullOrder = await tx.order.findUnique({
        where: { id: createdOrder.id },
        include: {
          OrdersItems: {
            include: {
              Attachments: true,
              Model: {
                include: {
                  Family: {
                    include: { Brand: true }
                  }
                }
              }
            }
          },
          Attachments: true,
          Payment: true,
          Client: true
        }
      })

      return fullOrder
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

    let orders = await prisma.order.findMany({
      where,
      include: {
        Client: true,
        Payment: true,
        OrdersItems: {
          include: {
            Attachments: true,
            Model: {
              include: {
                // Types: true,
                Family: { include: { Brand: true } }
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
    // count
    const total = await prisma.order.count({ where })
    // make the models
    orders = orders.map((item) => ({
      ...item,
      OrdersItems: item.OrdersItems.map((orderItem) => ({
        ...orderItem,
        Vehicle: {
          brand: orderItem.Model?.Family.Brand.name,
          model: orderItem.Model?.name,
          family: orderItem.Model?.Family.name
        }
      }))
    }))

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
