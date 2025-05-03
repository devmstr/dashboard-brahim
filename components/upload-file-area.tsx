'use client'

import type React from 'react'
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  UploadCloud,
  CheckCircle,
  XCircle,
  X,
  FileText,
  FileIcon,
  ImageIcon,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

type FileUploadResult = {
  success: boolean
  message: string
  fileName?: string
  uniqueFileName?: string
  url?: string
  storedPath?: string
  fileId?: string
}

interface InitialFile {
  id: string
  name: string
  uniqueName: string
  path: string
  url?: string
  fileId?: string
  type?: string
}

interface FileUploadAreaProps {
  acceptedFileTypes?: string
  maxFileSizeMB?: number
  multiple?: boolean
  onUpload: (file: File) => Promise<FileUploadResult>
  onDelete?: (fileId: string) => Promise<boolean> // Changed from fileName to fileId
  className?: string
  disabled?: boolean
  fileDeleteStates?: Record<string, boolean>
  initialFiles?: InitialFile[]
}

export function FileUploadArea({
  acceptedFileTypes = '.pdf,.jpg,.jpeg,.png,.tiff,.bmp',
  maxFileSizeMB = 10,
  multiple = true,
  onUpload,
  onDelete,
  className = '',
  disabled = false,
  fileDeleteStates = {},
  initialFiles = []
}: FileUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploads, setUploads] = useState<
    Array<{
      file: File | null
      status: UploadStatus
      progress: number
      result?: FileUploadResult
      id: string
      name: string
      url?: string
      fileId?: string
    }>
  >([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const progressIntervalsRef = useRef<Record<string, NodeJS.Timeout>>({})

  // Track processed files to avoid duplicates
  const processedFilesRef = useRef<Set<string>>(new Set())

  // Initialize uploads with initial files
  useEffect(() => {
    if (initialFiles.length === 0) return

    // Create a map of existing files by name to prevent duplicates
    const existingFileNames = new Set(uploads.map((upload) => upload.name))

    const newUploads = initialFiles
      .filter((file) => {
        // Skip files that are already in the uploads state
        if (existingFileNames.has(file.name)) return false

        // Also check our processed files reference
        if (processedFilesRef.current.has(file.name)) return false

        // Mark this file as processed
        processedFilesRef.current.add(file.name)
        return true
      })
      .map((file) => ({
        file: null,
        status: 'success' as UploadStatus,
        progress: 100,
        id: `file-${file.name}-${Date.now()}`,
        name: file.name,
        url: file.url,
        fileId: file.fileId,
        result: {
          success: true,
          message: 'File already uploaded',
          fileName: file.name,
          uniqueFileName: file.uniqueName,
          url: file.url,
          fileId: file.fileId
        }
      }))

    if (newUploads.length > 0) {
      setUploads((prev) => [...prev, ...newUploads])
    }
  }, [initialFiles])

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (disabled) return
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
    },
    [disabled]
  )

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (disabled) return
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const droppedFiles = Array.from(e.dataTransfer.files)
      handleFiles(droppedFiles)
    },
    [disabled]
  )

  const validateFile = useCallback(
    (file: File): { valid: boolean; errorMessage?: string } => {
      // Check file type
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`
      const acceptedExtensions = acceptedFileTypes.split(',')
      const isTypeValid =
        acceptedExtensions.includes(fileExtension) ||
        acceptedExtensions.includes('.*')

      if (!isTypeValid) {
        return {
          valid: false,
          errorMessage: `Type de fichier non accepté. Types acceptés: ${acceptedFileTypes}`
        }
      }

      // Check file size
      const maxSizeBytes = maxFileSizeMB * 1024 * 1024
      if (file.size > maxSizeBytes) {
        return {
          valid: false,
          errorMessage: `Fichier trop volumineux. Taille maximum: ${maxFileSizeMB}MB`
        }
      }

      return { valid: true }
    },
    [acceptedFileTypes, maxFileSizeMB]
  )

  const handleFiles = useCallback(
    async (newFiles: File[]) => {
      if (disabled) return

      for (const file of newFiles) {
        // Check if we already have this file by name
        if (processedFilesRef.current.has(file.name)) {
          continue
        }

        // Mark this file as being processed
        processedFilesRef.current.add(file.name)

        const fileId = `upload-${file.name}-${Date.now()}`
        const validation = validateFile(file)

        if (!validation.valid) {
          setUploads((prev) => [
            ...prev,
            {
              file,
              status: 'error',
              progress: 100,
              id: fileId,
              name: file.name,
              result: {
                success: false,
                message: validation.errorMessage || 'Fichier invalide',
                fileName: file.name
              }
            }
          ])
          continue
        }

        // Add file to uploads with "uploading" status
        setUploads((prev) => [
          ...prev,
          {
            file,
            status: 'uploading',
            progress: 0,
            id: fileId,
            name: file.name
          }
        ])

        // Start upload immediately
        uploadFile(file, fileId)
      }
    },
    [validateFile, disabled]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return
      if (e.target.files && e.target.files.length > 0) {
        const selectedFiles = Array.from(e.target.files)
        handleFiles(selectedFiles)

        // Reset the input value so the same file can be selected again
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [handleFiles, disabled]
  )

  const uploadFile = useCallback(
    async (file: File, fileId: string) => {
      try {
        // Simple progress simulation
        progressIntervalsRef.current[fileId] = setInterval(() => {
          setUploads((prev) =>
            prev.map((item) => {
              if (item.id === fileId && item.status === 'uploading') {
                const newProgress = Math.min(item.progress + 10, 90)
                return { ...item, progress: newProgress }
              }
              return item
            })
          )
        }, 300)

        // Perform the actual upload
        const result = await onUpload(file)

        // Clear the interval
        if (progressIntervalsRef.current[fileId]) {
          clearInterval(progressIntervalsRef.current[fileId])
          delete progressIntervalsRef.current[fileId]
        }

        // Update the upload status
        setUploads((prev) =>
          prev.map((item) =>
            item.id === fileId
              ? {
                  ...item,
                  status: result.success ? 'success' : 'error',
                  progress: 100,
                  result,
                  url: result.url,
                  fileId: result.fileId
                }
              : item
          )
        )
      } catch (error) {
        // Clear the interval
        if (progressIntervalsRef.current[fileId]) {
          clearInterval(progressIntervalsRef.current[fileId])
          delete progressIntervalsRef.current[fileId]
        }

        // Handle upload error
        setUploads((prev) =>
          prev.map((item) =>
            item.id === fileId
              ? {
                  ...item,
                  status: 'error',
                  progress: 100,
                  result: {
                    success: false,
                    message: 'Échec du téléchargement. Veuillez réessayer.',
                    fileName: file.name
                  }
                }
              : item
          )
        )

        // Remove from processed files so it can be tried again
        processedFilesRef.current.delete(file.name)
      }
    },
    [onUpload]
  )

  const handleDeleteFile = useCallback(
    async (fileId: string) => {
      // Find the upload item
      const uploadItem = uploads.find((item) => item.id === fileId)
      if (!uploadItem) return

      // If onDelete callback is provided, call it with the fileId
      if (onDelete) {
        try {
          // Use the fileId from the result or the upload item's id
          const idToDelete = uploadItem.fileId || uploadItem.id
          const success = await onDelete(idToDelete)
          if (!success) {
            console.error('Échec de la suppression du fichier:', idToDelete)
            return
          }
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
          return
        }
      }

      // Remove the file from the uploads list
      setUploads((prev) => prev.filter((item) => item.id !== fileId))

      // Remove from processed files so it can be uploaded again
      if (uploadItem.name) {
        processedFilesRef.current.delete(uploadItem.name)
      }
    },
    [uploads, onDelete]
  )

  const getFileIcon = useCallback(
    (fileName: string, showPreviewHint = false) => {
      const extension = fileName.split('.').pop()?.toLowerCase()

      if (
        ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'].includes(
          extension || ''
        )
      ) {
        return (
          <div className="relative">
            <ImageIcon className="h-8 w-8 text-secondary" />
            {showPreviewHint && (
              <div className="absolute -bottom-1 -right-1 bg-secondary text-white rounded-full p-0.5">
                <ExternalLink className="h-3 w-3" />
              </div>
            )}
          </div>
        )
      }

      if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
        return (
          <div className="relative">
            <FileText className="h-8 w-8 text-secondary" />
            {showPreviewHint && (
              <div className="absolute -bottom-1 -right-1 bg-secondary text-white rounded-full p-0.5">
                <ExternalLink className="h-3 w-3" />
              </div>
            )}
          </div>
        )
      }

      return (
        <div className="relative">
          <FileIcon className="h-8 w-8 text-secondary" />
          {showPreviewHint && (
            <div className="absolute -bottom-1 -right-1 bg-secondary text-white rounded-full p-0.5">
              <ExternalLink className="h-3 w-3" />
            </div>
          )}
        </div>
      )
    },
    []
  )

  // Clean up error uploads after 5 seconds
  useEffect(() => {
    const errorUploads = uploads.filter((upload) => upload.status === 'error')
    if (errorUploads.length > 0) {
      const timer = setTimeout(() => {
        setUploads((prev) => prev.filter((upload) => upload.status !== 'error'))

        // Remove error files from processed list so they can be tried again
        errorUploads.forEach((upload) => {
          processedFilesRef.current.delete(upload.name)
        })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [uploads])

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(progressIntervalsRef.current).forEach((interval) => {
        clearInterval(interval)
      })
    }
  }, [])

  // Function to truncate filename for display
  const truncateFilename = (filename: string, maxLength = 20) => {
    if (filename.length <= maxLength) return filename

    const extension = filename.split('.').pop() || ''
    const nameWithoutExt = filename.substring(
      0,
      filename.length - extension.length - 1
    )

    if (nameWithoutExt.length <= maxLength - 3 - extension.length) {
      return filename
    }

    return `${nameWithoutExt.substring(
      0,
      maxLength - 3 - extension.length
    )}...${extension ? `.${extension}` : ''}`
  }

  // Function to handle file preview
  const handleFilePreview = useCallback((url: string, fileName: string) => {
    if (!url) {
      console.error('No URL available for file:', fileName)
      return
    }

    console.log('Opening file for preview:', url)

    // Open the file in a new tab
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`relative min-h-40 border-2 border-dashed rounded-lg hover:border-secondary flex items-center justify-center cursor-pointer group transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/20'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Zone de téléchargement de fichiers"
        aria-disabled={disabled}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            fileInputRef.current?.click()
          }
        }}
      >
        <div className="text-center p-4">
          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground group-hover:text-secondary" />
          <p className="mt-2 text-sm text-muted-foreground group-hover:text-secondary">
            {disabled
              ? 'Téléchargement en cours...'
              : 'Sélectionner une pièce jointe'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground group-hover:text-secondary">
            Types de fichiers acceptés : {acceptedFileTypes}. Max :{' '}
            {maxFileSizeMB}MB par pièce jointe
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes}
          className="hidden"
          multiple={multiple}
          onChange={handleFileChange}
          disabled={disabled}
          aria-label="Sélectionner des fichiers"
        />
      </div>

      {uploads.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-1">
          {uploads.map((upload) => {
            const isDeleting = fileDeleteStates[upload.name] || false
            const displayName = truncateFilename(upload.name)

            return (
              <div
                key={upload.id}
                className="bg-muted/50 rounded-md p-3 space-y-2 relative"
              >
                {upload.status === 'success' && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 absolute top-1 right-1 z-10 hover:bg-secondary/30 hover:text-primary dark:hover:bg-red-900/30"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteFile(upload.id)
                          }}
                          aria-label={`Supprimer ${upload.name}`}
                          disabled={disabled || isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {isDeleting
                            ? 'Suppression en cours...'
                            : 'Supprimer le fichier'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                <div className="flex items-start space-x-2">
                  {upload.status === 'success' && upload.url ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              handleFilePreview(upload.url!, upload.name)
                            }}
                            className="h-14 w-14 flex-shrink-0 rounded-md overflow-hidden bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 hover:scale-105 transition-all relative"
                            role="button"
                            aria-label={`Ouvrir ${upload.name}`}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                if (upload.url) {
                                  handleFilePreview(upload.url, upload.name)
                                }
                              }
                            }}
                          >
                            {getFileIcon(upload.name, true)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Cliquez pour prévisualiser</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <div className="h-14 w-14 flex-shrink-0 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                      {getFileIcon(upload.name, false)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center space-x-1.5">
                      {upload.status === 'success' && !isDeleting && (
                        <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                      )}
                      {upload.status === 'success' && isDeleting && (
                        <Loader2 className="h-3.5 w-3.5 text-yellow-600 animate-spin flex-shrink-0" />
                      )}
                      {upload.status === 'error' && (
                        <XCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                      )}
                      {upload.status === 'uploading' && (
                        <UploadCloud className="h-3.5 w-3.5 text-secondary animate-pulse flex-shrink-0" />
                      )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs font-medium truncate block w-full max-w-[calc(100%-20px)]">
                              {displayName}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{upload.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <span className="text-xs text-muted-foreground block mt-1 truncate">
                      {upload.file
                        ? `${(upload.file.size / 1024 / 1024).toFixed(2)} MB •`
                        : ''}
                      {upload.status === 'uploading'
                        ? ' Téléchargement...'
                        : upload.status === 'success'
                        ? isDeleting
                          ? ' Suppression...'
                          : ' Téléchargé'
                        : ' Échec'}
                    </span>

                    {upload.status === 'error' && upload.result?.message && (
                      <div className="flex items-center mt-1 text-xs text-red-500">
                        <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {upload.result.message}
                        </span>
                      </div>
                    )}

                    {upload.status === 'success' && upload.fileId && (
                      <div className="mt-1">
                        <Badge
                          variant="outline"
                          className="text-xs font-normal"
                        >
                          ID: {upload.fileId}
                        </Badge>
                      </div>
                    )}

                    <Progress
                      value={upload.progress}
                      className={`h-1.5 mt-2 ${
                        upload.status === 'error'
                          ? 'bg-red-200'
                          : upload.status === 'success'
                          ? isDeleting
                            ? 'bg-yellow-200'
                            : 'bg-green-200'
                          : ''
                      }`}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
