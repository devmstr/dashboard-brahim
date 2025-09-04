import { type NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'
import { generateUniqueFilename } from '@/helpers/unique-name-file'

// Define the base uploads directory for physical storage
const BASE_UPLOADS_DIR = path.join(process.cwd(), 'uploads')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userPath = formData.get('path') as string

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    if (!userPath) {
      return NextResponse.json(
        { success: false, message: 'No path provided' },
        { status: 400 }
      )
    }

    // Validate path to prevent directory traversal attacks
    const normalizedPath = userPath.replace(/\.\./g, '').replace(/\/+/g, '/')
    if (normalizedPath !== userPath) {
      return NextResponse.json(
        { success: false, message: 'Invalid path' },
        { status: 400 }
      )
    }

    // Remove leading slash if present
    const relativePath = normalizedPath.startsWith('/')
      ? normalizedPath.substring(1)
      : normalizedPath

    // Create the full physical path where the file will be stored
    const fullUploadPath = path.join(BASE_UPLOADS_DIR, relativePath)

    // Create directory if it doesn't exist
    try {
      if (!existsSync(fullUploadPath)) {
        await mkdir(fullUploadPath, { recursive: true })
      }
    } catch (error) {
      console.error('Error creating directory:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to create directory' },
        { status: 500 }
      )
    }

    // Generate a unique filename using the SKU ID system
    const uniqueFilename = generateUniqueFilename(file.name)
    const physicalFilePath = path.join(fullUploadPath, uniqueFilename)

    // Create a URL-friendly path for accessing the file
    const urlPath = path.join(relativePath, uniqueFilename)

    // Store the original filename for reference
    const originalFilename = file.name

    // Get the file type (MIME type)
    const fileType = file.type || 'application/octet-stream'

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Write file to disk
    try {
      await writeFile(physicalFilePath, buffer)

      // Create the URL for the file
      const fileUrl = `/uploads/${urlPath}`

      return NextResponse.json({
        success: true,
        message: 'File uploaded successfully',
        fileName: originalFilename,
        uniqueFileName: uniqueFilename,
        storedPath: physicalFilePath,
        url: fileUrl,
        fileType: fileType
      })
    } catch (error) {
      console.error('Error writing file:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to write file' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
