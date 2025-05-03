import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET all attachments for a specific order
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params

    // Check if order exists
    const orderExists = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!orderExists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Get all attachments for the order
    const attachments = await prisma.attachment.findMany({
      where: { orderId }
    })

    return NextResponse.json(attachments)
  } catch (error) {
    console.error('Error fetching order attachments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order attachments' },
      { status: 500 }
    )
  }
}

// POST create a new attachment for a specific order
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params
    const body = await request.json()
    const { url, type, name } = body

    // Validate required fields
    if (!url || !type || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if order exists
    const orderExists = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!orderExists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Create new attachment
    const attachment = await prisma.attachment.create({
      data: {
        url,
        type,
        name,
        orderId
      }
    })

    return NextResponse.json(attachment, { status: 201 })
  } catch (error) {
    console.error('Error creating order attachment:', error)
    return NextResponse.json(
      { error: 'Failed to create order attachment' },
      { status: 500 }
    )
  }
}
