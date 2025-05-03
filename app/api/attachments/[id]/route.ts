import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET a specific attachment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid attachment ID' },
        { status: 400 }
      )
    }

    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: { Order: true }
    })

    if (!attachment) {
      return NextResponse.json(
        { error: 'Attachment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(attachment)
  } catch (error) {
    console.error('Error fetching attachment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attachment' },
      { status: 500 }
    )
  }
}

// PUT update an attachment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid attachment ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { url, type, name, orderId } = body

    // Check if attachment exists
    const attachmentExists = await prisma.attachment.findUnique({
      where: { id }
    })

    if (!attachmentExists) {
      return NextResponse.json(
        { error: 'Attachment not found' },
        { status: 404 }
      )
    }

    // If orderId is provided, check if order exists
    if (orderId) {
      const orderExists = await prisma.order.findUnique({
        where: { id: orderId }
      })

      if (!orderExists) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
    }

    // Update attachment
    const updatedAttachment = await prisma.attachment.update({
      where: { id },
      data: {
        ...(url && { url }),
        ...(type && { type }),
        ...(name && { name }),
        ...(orderId && { orderId })
      }
    })

    return NextResponse.json(updatedAttachment)
  } catch (error) {
    console.error('Error updating attachment:', error)
    return NextResponse.json(
      { error: 'Failed to update attachment' },
      { status: 500 }
    )
  }
}

// DELETE an attachment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid attachment ID' },
        { status: 400 }
      )
    }

    // Check if attachment exists
    const attachmentExists = await prisma.attachment.findUnique({
      where: { id }
    })

    if (!attachmentExists) {
      return NextResponse.json(
        { error: 'Attachment not found' },
        { status: 404 }
      )
    }

    // Delete attachment
    await prisma.attachment.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Attachment deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting attachment:', error)
    return NextResponse.json(
      { error: 'Failed to delete attachment' },
      { status: 500 }
    )
  }
}
