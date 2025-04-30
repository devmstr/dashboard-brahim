import { type NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json()

    if (!filePath) {
      return NextResponse.json(
        { success: false, message: 'No file path provided' },
        { status: 400 }
      )
    }

    // Validate path to prevent directory traversal attacks
    const normalizedPath = filePath.replace(/\.\./g, '').replace(/\/+/g, '/')
    if (normalizedPath !== filePath) {
      return NextResponse.json(
        { success: false, message: 'Invalid path' },
        { status: 400 }
      )
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: 'File not found' },
        { status: 404 }
      )
    }

    // Delete the file
    await unlink(filePath)

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
