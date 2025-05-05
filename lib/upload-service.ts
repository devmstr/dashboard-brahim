'use server'

import { revalidatePath } from 'next/cache'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import prisma from '@/lib/db' // Assuming you have a prisma client export
import { skuId } from './utils'

// Define the base uploads directory - must match the one in upload route
const BASE_UPLOADS_DIR = path.join(process.cwd(), 'uploads')

export type UploadResult = {
  success: boolean
  message: string
  fileName?: string
  storedPath?: string
  url?: string
  fileId?: number // Added to track the attachment ID
}

// This function creates an attachment record in the database
export async function createAttachment(
  orderId: string,
  fileName: string,
  fileUrl: string,
  fileType: string
): Promise<number | null> {
  try {
    const uniqueName = skuId('FL')
    const attachment = await prisma.attachment.create({
      data: {
        name: fileName,
        url: fileUrl,
        type: fileType,
        uniqueName,
        Order: {
          connect: {
            id: orderId
          }
        }
      }
    })
    return attachment.id
  } catch (error) {
    console.error('Error creating attachment record:', error)
    return null
  }
}

// This function deletes an attachment from the database and file system
export async function deleteAttachment(attachmentId: number): Promise<boolean> {
  try {
    // First, get the attachment to find its URL
    const attachment = await prisma.attachment.findUnique({
      where: {
        id: attachmentId
      }
    })

    if (!attachment) {
      console.error(`Attachment not found: ${attachmentId}`)
      return false
    }

    // Extract the file path from the URL
    const urlPath = attachment.url.replace(/^\/uploads\//, '')
    const filePath = path.join(BASE_UPLOADS_DIR, urlPath)

    // Delete the file from the filesystem
    if (existsSync(filePath)) {
      await unlink(filePath)
    }

    // Delete the attachment record from the database
    await prisma.attachment.delete({
      where: {
        id: attachmentId
      }
    })

    // Revalidate the path to update any server components
    revalidatePath('/')

    return true
  } catch (error) {
    console.error('Delete attachment error:', error)
    return false
  }
}

// Legacy function for backward compatibility
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
