import { type NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Define the base uploads directory
const BASE_UPLOADS_DIR = path.join(process.cwd(), 'uploads')

// This is a Node.js API route, not middleware
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
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
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

    // Set cache headers based on file type
    let cacheControl = 'public, max-age=3600' // Default 1 hour cache

    // Set long cache for static assets
    if (
      ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf'].includes(ext)
    ) {
      cacheControl = 'public, max-age=31536000, immutable' // 1 year cache
    }

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(
          physicalFilePath
        )}"`,
        'Cache-Control': cacheControl
      }
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
  }
}
