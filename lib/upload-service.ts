'use server'

import { revalidatePath } from 'next/cache'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Define the base uploads directory - must match the one in upload route
const BASE_UPLOADS_DIR = path.join(process.cwd(), 'uploads')

export type UploadResult = {
  success: boolean
  message: string
  fileName?: string
  storedPath?: string
  url?: string
}

// This server action directly handles file deletion
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    if (!filePath) {
      console.error('No file path provided')
      return false
    }

    // If the path is already an absolute path, use it directly
    // Otherwise, assume it's a relative path and join with BASE_UPLOADS_DIR
    const physicalFilePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(BASE_UPLOADS_DIR, filePath)

    // Validate path to prevent directory traversal attacks
    const normalizedPath = physicalFilePath
      .replace(/\.\./g, '')
      .replace(/\/+/g, '/')
    if (normalizedPath !== physicalFilePath) {
      console.error('Invalid path detected')
      return false
    }

    // Check if file exists
    if (!existsSync(physicalFilePath)) {
      console.error(`File not found: ${physicalFilePath}`)
      return false
    }

    // Delete the file
    await unlink(physicalFilePath)

    // Revalidate the path to update any server components
    revalidatePath('/')

    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}
