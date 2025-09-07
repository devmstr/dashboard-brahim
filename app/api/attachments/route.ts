import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { generateUniqueFilename } from '@/helpers/unique-name-file'

// GET all attachments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const orderId = searchParams.get('orderId')

    // If orderId is provided, filter by order
    const attachments = orderId
      ? await prisma.attachment.findMany({
          where: { orderId },
          include: { Order: true }
        })
      : await prisma.attachment.findMany({
          include: { Order: true }
        })

    return NextResponse.json(attachments)
  } catch (error) {
    console.error('Error fetching attachments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attachments' },
      { status: 500 }
    )
  }
}

// POST create a new attachment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, type, name, orderId } = body

    // Validate required fields
    if (!url || !type || !name || !orderId) {
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

    const uniqueName = generateUniqueFilename(name)

    // Create new attachment
    const attachment = await prisma.attachment.create({
      data: {
        url,
        type,
        name,
        orderId,
        uniqueName
      }
    })

    return NextResponse.json(attachment, { status: 201 })
  } catch (error) {
    console.error('Error creating attachment:', error)
    return NextResponse.json(
      { error: 'Failed to create attachment' },
      { status: 500 }
    )
  }
}
