import { type NextRequest, NextResponse } from 'next/server'
import { createAttachment } from '@/lib/upload-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, fileName, fileUrl, fileType } = body

    if (!orderId || !fileName || !fileUrl) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    try {
      const attachmentId = await createAttachment(
        orderId,
        fileName,
        fileUrl,
        fileType || 'application/octet-stream'
      )

      return NextResponse.json({
        success: true,
        message: 'Attachment created successfully',
        fileId: attachmentId
      })
    } catch (error) {
      console.error('Error creating attachment:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to create attachment' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Create attachment error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
