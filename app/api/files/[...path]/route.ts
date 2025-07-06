import { type NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Define the base uploads directory - must match the one in upload route
const BASE_UPLOADS_DIR = path.join(process.cwd(), 'uploads')

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Join the path segments to create the relative file path
    const relativePath = path.join(...params.path)

    // Validate path to prevent directory traversal
    const normalizedPath = relativePath.replace(/\.\./g, '')
    if (normalizedPath !== relativePath) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    // Create the full physical path to the file
    const physicalFilePath = path.join(BASE_UPLOADS_DIR, normalizedPath)

    // Check if file exists
    if (!existsSync(physicalFilePath)) {
      return NextResponse.json(
        { error: 'File not found', path: physicalFilePath },
        { status: 404 }
      )
    }

    // Read file
    const fileBuffer = await readFile(physicalFilePath)

    // Determine content type based on file extension
    const ext = path.extname(physicalFilePath).toLowerCase()
    let contentType = 'application/octet-stream'

    if (ext === '.pdf') contentType = 'application/pdf'
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
    else if (ext === '.png') contentType = 'image/png'
    else if (ext === '.tiff') contentType = 'image/tiff'
    else if (ext === '.bmp') contentType = 'image/bmp'

    // Return file with appropriate headers
    return new NextResponse(fileBuffer as any, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(
          physicalFilePath
        )}"`
      }
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
  }
}
