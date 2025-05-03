'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { FileUploadArea } from '@/components/upload-file-area'
import { toast } from '@/hooks/use-toast'
import type { Attachment } from '@/lib/validations/order'
import { skuId } from '@/lib/utils'

interface OrderUploaderProps {
  uploadPath: string
  initialAttachments?: Attachment[]
  onAttachmentAdded?: (attachment: Attachment) => void
  onAttachmentDeleted?: (fileName: string) => void
  acceptedFileTypes?: string
  maxFileSizeMB?: number
  maxFiles?: number
  isShowDestination?: boolean
  disabled?: boolean
}

export const OrderUploader: React.FC<OrderUploaderProps> = ({
  uploadPath,
  initialAttachments = [],
  onAttachmentAdded,
  onAttachmentDeleted,
  acceptedFileTypes = '.pdf,.jpg,.jpeg,.png,.tiff',
  maxFileSizeMB = 20,
  maxFiles = 10,
  isShowDestination = false,
  disabled = false
}) => {
  // State to track all uploaded files
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({})

  // Initialize attachments from props once
  useEffect(() => {
    if (initialAttachments && initialAttachments.length > 0) {
      // Create a map of existing file names to prevent duplicates
      const existingFileNames = new Set(attachments.map((file) => file.name))

      // Only add files that aren't already in our state
      const newAttachments = initialAttachments.filter(
        (attachment) => !existingFileNames.has(attachment.name)
      )

      if (newAttachments.length > 0) {
        setAttachments((prev) => [...prev, ...newAttachments])
      }
    }
  }, [initialAttachments]) // Only run when initialAttachments changes

  // Handle file upload
  const handleUpload = async (file: File) => {
    // Check if max files limit is reached
    if (attachments.length >= maxFiles) {
      toast({
        title: 'Limite atteinte',
        description: `Vous ne pouvez pas télécharger plus de ${maxFiles} fichiers.`,
        variant: 'warning'
      })
      return {
        success: false,
        message: `Limite de ${maxFiles} fichiers atteinte.`
      }
    }

    setIsUploading(true)

    try {
      // Upload the file
      const formData = new FormData()
      formData.append('file', file)
      formData.append('path', uploadPath)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error((await response.json()).message || 'Upload failed')
      }

      const result = await response.json()

      if (result.success) {
        // Create new attachment
        const newAttachment: Attachment = {
          id: skuId('FL'),
          name: file.name,
          uniqueName: result.uniqueFileName || file.name,
          path: result.storedPath || '',
          url: result.url || '',
          type: file.type
        }

        // Update state
        const updatedAttachments = [...attachments, newAttachment]
        setAttachments(updatedAttachments)

        // Notify parent using the specific handler
        if (onAttachmentAdded) {
          onAttachmentAdded(newAttachment)
        }

        toast({
          title: 'Succès !',
          description: <span>Téléchargement réussi : {file.name}</span>,
          variant: 'success'
        })

        return { success: true, ...result }
      } else {
        throw new Error(result.message || 'Upload failed')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue'

      toast({
        title: 'Échec !',
        description: <span>Échec du téléchargement: {message}</span>,
        variant: 'destructive'
      })

      return { success: false, message }
    } finally {
      setIsUploading(false)
    }
  }

  // Handle file deletion
  const handleDelete = async (fileName: string) => {
    const fileToDelete = attachments.find((file) => file.name === fileName)
    if (!fileToDelete) return false

    setIsDeleting((prev) => ({ ...prev, [fileName]: true }))

    try {
      // Only try to delete from server if we have a path
      if (fileToDelete.path) {
        const response = await fetch('/api/delete-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath: fileToDelete.path })
        })

        if (!response.ok) {
          throw new Error('Failed to delete file')
        }
      }

      // Update state
      const updatedAttachments = attachments.filter(
        (file) => file.name !== fileName
      )
      setAttachments(updatedAttachments)

      // Notify parent using the specific handler
      if (onAttachmentDeleted) {
        onAttachmentDeleted(fileName)
      }

      toast({
        title: 'Fichier supprimé',
        description: <span>{fileName} a été supprimé</span>,
        variant: 'information'
      })

      return true
    } catch (error) {
      toast({
        title: 'Erreur',
        description: <span>Erreur lors de la suppression du fichier</span>,
        variant: 'destructive'
      })
      return false
    } finally {
      setIsDeleting((prev) => ({ ...prev, [fileName]: false }))
    }
  }

  return (
    <div>
      {isShowDestination && (
        <div className="mb-2 text-sm text-muted-foreground">
          Dossier de destination:{' '}
          <code className="bg-muted px-1 py-0.5 rounded">{`uploads/${uploadPath.replace(
            /^\/+/,
            ''
          )}`}</code>
        </div>
      )}
      <FileUploadArea
        acceptedFileTypes={acceptedFileTypes}
        maxFileSizeMB={maxFileSizeMB}
        multiple={true}
        onUpload={handleUpload}
        onDelete={handleDelete}
        disabled={isUploading || disabled}
        fileDeleteStates={isDeleting}
        initialFiles={attachments.map((file) => ({
          id: file.id,
          name: file.name,
          uniqueName: file.uniqueName || file.name,
          path: file.path || '',
          url: file.url,
          fileId: file.id,
          type: file.type
        }))}
      />
    </div>
  )
}
