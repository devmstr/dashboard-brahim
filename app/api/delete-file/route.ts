import { type NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const BASE_UPLOADS_DIR = path.resolve(process.cwd(), 'uploads')

const resolveUploadPath = (filePath: string) => {
  if (!filePath) return null

  if (filePath.startsWith('/uploads/')) {
    const relative = filePath.replace(/^\/uploads\//, '')
    return path.join(BASE_UPLOADS_DIR, relative)
  }

  if (/^uploads[\\/]/.test(filePath)) {
    const relative = filePath.replace(/^uploads[\\/]/, '')
    return path.join(BASE_UPLOADS_DIR, relative)
  }

  if (path.isAbsolute(filePath)) {
    return filePath
  }

  return path.join(BASE_UPLOADS_DIR, filePath)
}

export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json()

    if (!filePath) {
      return NextResponse.json(
        { success: false, message: 'No file path provided' },
        { status: 400 }
      )
    }

    const resolvedPath = resolveUploadPath(filePath)
    if (!resolvedPath) {
      return NextResponse.json(
        { success: false, message: 'Invalid path' },
        { status: 400 }
      )
    }

    const normalizedPath = path.resolve(resolvedPath)
    if (!normalizedPath.startsWith(BASE_UPLOADS_DIR)) {
      return NextResponse.json(
        { success: false, message: 'Invalid path' },
        { status: 400 }
      )
    }

    // Check if file exists
    if (!existsSync(normalizedPath)) {
      return NextResponse.json(
        { success: false, message: 'File not found' },
        { status: 404 }
      )
    }

    // Delete the file
    await unlink(normalizedPath)

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
