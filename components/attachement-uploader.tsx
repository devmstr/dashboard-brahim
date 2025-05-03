'use client'

import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { FileUploadArea } from '@/components/upload-file-area'
import { toast } from '@/components/ui/use-toast'

export type UploadedFile = {
  name: string // Original filename
  uniqueName: string // Unique filename
  path: string
  url: string
  fileId?: number // Optional ID in the database
  type: string // MIME type
}

type FileUploadResult = {
  success: boolean
  message: string
  fileName?: string
  uniqueFileName?: string
  url?: string
  storedPath?: string
  fileId?: number
}

interface OrderAttachmentUploaderProps {
  orderId: string
  uploadPath: string
  initialAttachments?: Array<{
    id: number
    name: string
    url: string
    type: string
  }>
  onAttachmentsChanged?: (
    attachments: Array<{
      id: number
      name: string
      url: string
      type: string
    }>
  ) => void
  acceptedFileTypes?: string
  maxFileSizeMB?: number
  maxFiles?: number
  isShowDestination?: boolean
  disabled?: boolean
}

export const OrderAttachmentUploader: React.FC<
  OrderAttachmentUploaderProps
> = ({
  orderId,
  uploadPath,
  initialAttachments = [],
  onAttachmentsChanged,
  acceptedFileTypes = '.pdf,.jpg,.jpeg,.png,.tiff',
  maxFileSizeMB = 20,
  maxFiles = 10,
  isShowDestination = false,
  disabled = false
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({})
  const initialFilesProcessed = useRef(false)

  // Initialize with initial attachments
  useEffect(() => {
    if (initialAttachments.length > 0 && !initialFilesProcessed.current) {
      // Create a map of existing file IDs to prevent duplicates
      const existingFileIds = new Set(
        uploadedFiles
          .filter((file) => file.fileId !== undefined)
          .map((file) => file.fileId)
      )

      const filesToAdd = initialAttachments
        .filter((attachment) => {
          // Skip attachments that are already in the uploadedFiles state
          return !existingFileIds.has(attachment.id)
        })
        .map((attachment) => ({
          name: attachment.name,
          uniqueName: attachment.name,
          path: attachment.url,
          url: attachment.url,
          fileId: attachment.id,
          type: attachment.type
        }))

      if (filesToAdd.length > 0) {
        setUploadedFiles((prev) => [...prev, ...filesToAdd])
      }

      initialFilesProcessed.current = true
    }
  }, [initialAttachments, uploadedFiles])

  // Handle file upload
  const handleUpload = async (file: File): Promise<FileUploadResult> => {
    console.log(`Uploading file: ${file.name} to path: ${uploadPath}`)

    // Check if max files limit is reached
    if (uploadedFiles.length >= maxFiles) {
      toast({
        title: 'Limite atteinte',
        description: `Vous ne pouvez pas télécharger plus de ${maxFiles} fichiers.`,
        variant: 'warning'
      })

      return {
        success: false,
        message: `Limite de ${maxFiles} fichiers atteinte.`,
        fileName: file.name
      }
    }

    setIsUploading(true)

    try {
      // Step 1: Upload the file using the generic upload endpoint
      const formData = new FormData()
      formData.append('file', file)
      formData.append('path', uploadPath)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        setIsUploading(false)

        toast({
          title: 'Échec !',
          description: (
            <span>
              Échec du téléchargement de {file.name}:{' '}
              {errorData.message || 'Erreur du serveur'}
            </span>
          ),
          variant: 'destructive'
        })

        return {
          success: false,
          message: errorData.message || 'Upload failed',
          fileName: file.name
        }
      }

      const uploadResult = await uploadResponse.json()

      // Step 2: If we have an order ID, create an attachment in the database
      if (orderId && uploadResult.success) {
        try {
          const attachmentResponse = await fetch(
            '/api/attachments/create-from-upload',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                orderId: orderId,
                fileName: file.name,
                fileUrl: uploadResult.url,
                fileType: file.type
              })
            }
          )

          if (attachmentResponse.ok) {
            const attachment = await attachmentResponse.json()
            // Update the result with the attachment ID
            uploadResult.fileId = attachment.fileId
          }
        } catch (error) {
          console.error('Error creating attachment:', error)
        }
      }

      if (uploadResult.success) {
        const newFile: UploadedFile = {
          name: file.name,
          uniqueName: uploadResult.uniqueFileName || file.name,
          path: uploadResult.storedPath || '',
          url: uploadResult.url || '',
          fileId: uploadResult.fileId,
          type: file.type
        }

        const newFiles = [...uploadedFiles, newFile]
        setUploadedFiles(newFiles)

        // Notify parent component if callback provided
        if (onAttachmentsChanged) {
          const allAttachments = [
            ...initialAttachments,
            {
              id: uploadResult.fileId || 0,
              name: file.name,
              url: uploadResult.url || '',
              type: file.type
            }
          ]
          onAttachmentsChanged(allAttachments)
        }

        toast({
          title: 'Succès !',
          description: <span>Téléchargement réussi : {file.name}</span>,
          variant: 'success'
        })
      } else {
        toast({
          title: 'Échec !',
          description: (
            <span>
              Échec du téléchargement de {file.name}: {uploadResult.message}
            </span>
          ),
          variant: 'destructive'
        })
      }

      setIsUploading(false)
      return uploadResult
    } catch (error) {
      console.error('Upload error:', error)
      setIsUploading(false)

      const errorMessage =
        error instanceof Error ? error.message : 'Erreur inconnue'

      toast({
        title: 'Erreur !',
        description: <span>Erreur lors du téléchargement: {errorMessage}</span>,
        variant: 'destructive'
      })

      return {
        success: false,
        message: errorMessage,
        fileName: file.name
      }
    }
  }

  // Handle file deletion
  const handleDelete = async (fileName: string): Promise<boolean> => {
    // Find the file in our state
    const fileToDelete = uploadedFiles.find((file) => file.name === fileName)
    if (!fileToDelete) {
      return false
    }

    // Set deleting state for this file
    setIsDeleting((prev) => ({ ...prev, [fileName]: true }))

    try {
      let success = false

      // If the file has an attachment ID, delete the attachment
      if (fileToDelete.fileId) {
        const response = await fetch(
          `/api/attachments/${fileToDelete.fileId}`,
          {
            method: 'DELETE'
          }
        )

        if (!response.ok) {
          throw new Error('Failed to delete attachment')
        }

        success = true
      } else if (fileToDelete.path) {
        // Otherwise use the file deletion API
        const response = await fetch('/api/delete-file', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ filePath: fileToDelete.path })
        })

        if (!response.ok) {
          throw new Error('Failed to delete file')
        }

        const result = await response.json()
        success = result.success
      }

      // Reset deleting state
      setIsDeleting((prev) => ({ ...prev, [fileName]: false }))

      if (success) {
        // Update state - remove the deleted file
        setUploadedFiles((prev) =>
          prev.filter((file) => file.name !== fileName)
        )

        // Notify parent component if callback provided
        if (onAttachmentsChanged && fileToDelete.fileId) {
          const updatedAttachments = initialAttachments.filter(
            (attachment) => attachment.id !== fileToDelete.fileId
          )
          onAttachmentsChanged(updatedAttachments)
        }

        toast({
          title: 'Fichier supprimé',
          description: <span>{fileName} a été supprimé</span>,
          variant: 'information'
        })

        return true
      } else {
        toast({
          title: 'Échec de la suppression',
          description: <span>Impossible de supprimer {fileName}</span>,
          variant: 'destructive'
        })
        return false
      }
    } catch (error) {
      // Reset deleting state
      setIsDeleting((prev) => ({ ...prev, [fileName]: false }))

      console.error('Delete error:', error)
      toast({
        title: 'Erreur',
        description: <span>Erreur lors de la suppression du fichier</span>,
        variant: 'destructive'
      })
      return false
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
        initialFiles={uploadedFiles.map((file) => ({
          name: file.name,
          uniqueName: file.uniqueName,
          path: file.path,
          url: file.url,
          fileId: file.fileId,
          type: file.type
        }))}
      />
    </div>
  )
}
