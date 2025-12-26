'use client'

import React from 'react'
import { FileUploadArea } from '@/components/upload-file-area'
import type { Attachment } from '@/lib/validations/order'
import {
  createProcurementAttachment,
  deleteProcurementAttachment
} from '@/lib/procurement/actions'
import { toast } from '@/hooks/use-toast'

type ProcurementAttachmentTarget =
  | 'requisition'
  | 'rfq'
  | 'purchaseOrder'
  | 'receipt'
  | 'supplierInvoice'
  | 'contract'
  | 'asset'

interface ProcurementUploaderProps {
  target: ProcurementAttachmentTarget
  targetId?: string
  uploadPath: string
  initialAttachments?: Attachment[]
  onAttachmentAdded?: (attachment: Attachment) => void
  onAttachmentDeleted?: (fileId: string) => void
  acceptedFileTypes?: string
  maxFileSizeMB?: number
  maxFiles?: number
  showDestination?: boolean
  disabled?: boolean
}

export const ProcurementUploader: React.FC<ProcurementUploaderProps> = ({
  target,
  targetId,
  uploadPath,
  initialAttachments,
  onAttachmentAdded,
  onAttachmentDeleted,
  acceptedFileTypes,
  maxFileSizeMB,
  maxFiles,
  showDestination,
  disabled
}) => {
  const [isUploading, setIsUploading] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState<Record<string, boolean>>(
    {}
  )

  const canUpload = Boolean(targetId) && !disabled

  const handleUpload = async (file: File) => {
    if (!targetId) {
      return {
        success: false,
        message: 'Enregistrez avant d’ajouter une pièce jointe.'
      }
    }

    if (maxFiles && (initialAttachments?.length ?? 0) >= maxFiles) {
      return {
        success: false,
        message: `Limite de ${maxFiles} fichiers atteinte.`
      }
    }

    setIsUploading(true)

    try {
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

      if (!result.success) {
        throw new Error(result.message || 'Upload failed')
      }

      const created = await createProcurementAttachment(target, targetId, {
        id: '',
        name: file.name,
        uniqueName: result.uniqueFileName,
        url: result.url,
        type: file.type
      })

      const attachment: Attachment = {
        id: created.id,
        name: created.name,
        uniqueName: created.uniqueName,
        url: created.url,
        type: created.type
      }

      onAttachmentAdded?.(attachment)

      return {
        success: true,
        message: 'Upload réussi',
        fileName: file.name,
        uniqueFileName: created.uniqueName,
        url: created.url,
        fileId: created.id
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue'
      toast({
        title: 'Échec',
        description: message,
        variant: 'destructive'
      })
      return { success: false, message }
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (fileId: string) => {
    if (!fileId) return false
    const attachment = initialAttachments?.find((file) => file.id === fileId)
    const key = attachment?.name ?? fileId
    setIsDeleting((prev) => ({ ...prev, [key]: true }))

    try {
      await deleteProcurementAttachment(fileId)
      onAttachmentDeleted?.(fileId)
      return true
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression du fichier',
        variant: 'destructive'
      })
      return false
    } finally {
      setIsDeleting((prev) => ({ ...prev, [key]: false }))
    }
  }

  return (
    <div>
      {showDestination && (
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
        disabled={!canUpload || isUploading}
        fileDeleteStates={isDeleting}
        initialFiles={
          initialAttachments?.map((file) => ({
            id: file.id,
            name: file.name ?? '',
            uniqueName: file.uniqueName || file.name || '',
            path: file.url || '',
            url: file.url,
            fileId: file.id,
            type: file.type
          })) ?? []
        }
      />
      {!targetId && (
        <p className="text-xs text-muted-foreground mt-2">
          Enregistrez la fiche avant d’ajouter des pièces jointes.
        </p>
      )}
    </div>
  )
}
