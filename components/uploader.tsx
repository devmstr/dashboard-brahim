'use client'

import type React from 'react'
import { FileUploadArea } from '@/components/upload-file-area'
import { useState } from 'react'
import { toast } from '@/components/ui/use-toast'
import { deleteFile } from '@/lib/upload-service'

interface UploadedFile {
  name: string // Original filename
  uniqueName: string // SKU ID filename
  path: string
  url?: string
}

interface Props {
  uploadPath: string
  onFilesUploaded?: (files: UploadedFile[]) => void
  maxFiles?: number
  acceptedFileTypes?: string
  maxFileSizeMB?: number
  isShowDestination?: boolean
}

export const Uploader: React.FC<Props> = ({
  uploadPath,
  onFilesUploaded,
  maxFiles = 10,
  acceptedFileTypes = '.pdf,.jpg,.jpeg,.png,.tiff',
  maxFileSizeMB = 20,
  isShowDestination = false
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({})

  // Handle file upload - this is a client function, not a server action
  const handleUpload = async (file: File) => {
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
      // Create FormData and append the file and path
      const formData = new FormData()
      formData.append('file', file)
      formData.append('path', uploadPath)

      // Send to API route using fetch directly
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
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

      const result = await response.json()

      if (result.success) {
        const newFile: UploadedFile = {
          name: file.name,
          uniqueName: result.uniqueFileName || '',
          path: result.storedPath || '',
          url: result.url
        }

        const newFiles = [...uploadedFiles, newFile]
        setUploadedFiles(newFiles)

        // Notify parent component if callback provided
        if (onFilesUploaded) {
          onFilesUploaded(newFiles)
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
              Échec du téléchargement de {file.name}: {result.message}
            </span>
          ),
          variant: 'destructive'
        })
      }

      setIsUploading(false)
      return result
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
  const handleDelete = async (fileName: string) => {
    // Find the file in our state
    const fileToDelete = uploadedFiles.find((file) => file.name === fileName)
    if (!fileToDelete || !fileToDelete.path) {
      return false
    }

    // Set deleting state for this file
    setIsDeleting((prev) => ({ ...prev, [fileName]: true }))

    try {
      // Delete the file from the server using the server action
      const success = await deleteFile(fileToDelete.path)

      // Reset deleting state
      setIsDeleting((prev) => ({ ...prev, [fileName]: false }))

      if (success) {
        // Update state
        const newFiles = uploadedFiles.filter((file) => file.name !== fileName)
        setUploadedFiles(newFiles)

        // Notify parent component if callback provided
        if (onFilesUploaded) {
          onFilesUploaded(newFiles)
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
        disabled={isUploading}
        fileDeleteStates={isDeleting}
      />
    </div>
  )
}
