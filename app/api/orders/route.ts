import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Extract data from the request body
    const {
      clientId,
      deadline,
      state,
      progress,
      payment,
      orderItems,
      attachments
    } = body

    // Validate required fields
    if (!clientId) {
      return NextResponse.json(
        { message: 'Client ID is required' },
        { status: 400 }
      )
    }

    if (
      !payment ||
      typeof payment.amount !== 'number' ||
      typeof payment.deposit !== 'number'
    ) {
      return NextResponse.json(
        { message: 'Valid payment information is required' },
        { status: 400 }
      )
    }

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return NextResponse.json(
        { message: 'At least one order item is required' },
        { status: 400 }
      )
    }

    // Create the payment record first
    const createdPayment = await prisma.payment.create({
      data: {
        amount: payment.amount,
        deposit: payment.deposit,
        remaining: payment.remaining || payment.amount - payment.deposit
      }
    })

    // Create the order with the payment ID
    const createdOrder = await prisma.order.create({
      data: {
        clientId,
        deadline: new Date(deadline),
        state: state || 'PENDING',
        progress: progress || 0,
        paymentId: createdPayment.id,
        // Create order items
        OrdersItems: {
          create: orderItems.map((item: any) => ({
            note: item.note || {},
            description: item.description || {},
            modification: item.modification || {},
            packaging: item.packaging,
            fabrication: item.fabrication,
            isModified: item.isModified,
            radiatorId: item.radiatorId
          }))
        },
        // Create attachments if provided
        ...(attachments && attachments.length > 0
          ? {
              Attachments: {
                create: attachments.map((attachment: any) => ({
                  url: attachment.url,
                  type: attachment.type || 'unknown',
                  name: attachment.name
                }))
              }
            }
          : {})
      },
      include: {
        OrdersItems: true,
        Attachments: true,
        Payment: true,
        Client: true
      }
    })

    return NextResponse.json(createdOrder)
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
            Radiator: true
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
