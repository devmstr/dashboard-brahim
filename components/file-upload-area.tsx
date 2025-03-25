'use client'

import type React from 'react'

import { useState, useRef, useEffect } from 'react'
import {
  UploadCloud,
  CheckCircle,
  XCircle,
  X,
  FileText,
  FileIcon,
  ImageIcon
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

type FileUploadResult = {
  success: boolean
  message: string
  fileName?: string
  url?: string
}

interface FileUploadAreaProps {
  acceptedFileTypes?: string
  maxFileSizeMB?: number
  multiple?: boolean
  onUpload: (file: File) => Promise<FileUploadResult>
  onDelete?: (fileName: string) => Promise<boolean>
  className?: string
}

export function FileUploadArea({
  acceptedFileTypes = '.pdf,.jpg,.jpeg,.png,.tiff,.bmp',
  maxFileSizeMB = 10,
  multiple = true,
  onUpload,
  onDelete,
  className = ''
}: FileUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploads, setUploads] = useState<
    Array<{
      file: File
      status: UploadStatus
      progress: number
      result?: FileUploadResult
    }>
  >([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      handleFiles(selectedFiles)

      // Reset the input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFiles = async (newFiles: File[]) => {
    // Filter files by accepted types
    const acceptedExtensions = acceptedFileTypes.split(',')
    const filteredFiles = newFiles.filter((file) => {
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`
      return (
        acceptedExtensions.includes(fileExtension) ||
        acceptedExtensions.includes('.*')
      )
    })

    // Filter files by size
    const maxSizeBytes = maxFileSizeMB * 1024 * 1024
    const validFiles = filteredFiles.filter((file) => file.size <= maxSizeBytes)

    // Show error for invalid files
    if (validFiles.length !== newFiles.length) {
      const invalidFiles = newFiles.filter((file) => !validFiles.includes(file))
      for (const file of invalidFiles) {
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`
        const isTypeInvalid =
          !acceptedExtensions.includes(fileExtension) &&
          !acceptedExtensions.includes('.*')
        const isSizeInvalid = file.size > maxSizeBytes

        const errorMessage = isTypeInvalid
          ? `Invalid file type. Accepted types: ${acceptedFileTypes}`
          : isSizeInvalid
          ? `File too large. Maximum size: ${maxFileSizeMB}MB`
          : 'Invalid file'

        setUploads((prev) => [
          ...prev,
          {
            file,
            status: 'error',
            progress: 100,
            result: {
              success: false,
              message: errorMessage,
              fileName: file.name
            }
          }
        ])
      }
    }

    // Process valid files
    for (const file of validFiles) {
      // Add file to uploads with "uploading" status
      setUploads((prev) => [
        ...prev,
        {
          file,
          status: 'uploading',
          progress: 0
        }
      ])

      // Start upload immediately
      uploadFile(file)
    }
  }

  const uploadFile = async (file: File) => {
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploads((prev) =>
          prev.map((item) =>
            item.file === file && item.status === 'uploading'
              ? { ...item, progress: Math.min(item.progress + 5, 90) }
              : item
          )
        )
      }, 100)
      // Perform the actual upload
      const result = await onUpload(file)
      clearInterval(progressInterval)
      // Update the upload status
      setUploads((prev) =>
        prev.map((item) =>
          item.file === file
            ? {
                ...item,
                status: result.success ? 'success' : 'error',
                progress: 100,
                result
              }
            : item
        )
      )
    } catch (error) {
      // Handle upload error
      setUploads((prev) =>
        prev.map((item) =>
          item.file === file
            ? {
                ...item,
                status: 'error',
                progress: 100,
                result: {
                  success: false,
                  message: 'Upload failed. Please try again.',
                  fileName: file.name
                }
              }
            : item
        )
      )
    }
  }

  const handleDeleteFile = async (fileName: string) => {
    // Find the upload item
    const uploadItem = uploads.find((item) => item.file.name === fileName)
    if (!uploadItem) return

    // If onDelete callback is provided, call it
    if (onDelete) {
      try {
        const success = await onDelete(fileName)
        if (!success) {
          console.error('Failed to delete file from server:', fileName)
          return
        }
      } catch (error) {
        console.error('Error deleting file:', error)
        return
      }
    }

    // Remove the file from the uploads list
    setUploads((prev) => prev.filter((item) => item.file.name !== fileName))
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    if (
      ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'].includes(
        extension || ''
      )
    ) {
      return <ImageIcon className="h-8 w-8 text-secondary" />
    } else if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
      return <FileText className="h-8 w-8 text-secondary" />
    } else {
      return <FileIcon className="h-8 w-8 text-secondary" />
    }
  }

  // Clean up error uploads after 5 seconds
  useEffect(() => {
    const errorUploads = uploads.filter((upload) => upload.status === 'error')
    if (errorUploads.length > 0) {
      const timer = setTimeout(() => {
        setUploads((prev) => prev.filter((upload) => upload.status !== 'error'))
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [uploads])

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`relative min-h-40 border-2 border-dashed rounded-lg hover:border-secondary flex items-center justify-center cursor-pointer group transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/20'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-center p-4 ">
          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground group-hover:text-secondary" />
          <p className="mt-2 text-sm text-muted-foreground group-hover:text-secondary">
            Sélectionner une pièce jointe.
          </p>
          <p className="mt-1 text-xs text-muted-foreground group-hover:text-secondary">
            {`Types de fichiers acceptés : ${acceptedFileTypes}`}.
            {`Max : ${maxFileSizeMB}MB par pièce jointe`}
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes}
          className="hidden"
          multiple={multiple}
          onChange={handleFileChange}
        />
      </div>

      {uploads.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4   gap-3 max-h-96 overflow-y-auto pr-1">
          {uploads.map((upload, index) => (
            <div
              key={index}
              className="bg-muted/50 rounded-md p-4 space-y-2 relative"
            >
              {upload.status === 'success' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 absolute top-1 right-1 z-10 hover:bg-secondary/30 hover:text-primary dark:hover:bg-red-900/30"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteFile(upload.file.name)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              <div className="flex items-start space-x-3">
                <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                  {getFileIcon(upload.file.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    {upload.status === 'success' && (
                      <CheckCircle className=" h-4 w-4 text-primary flex-shrink-0" />
                    )}
                    {upload.status === 'error' && (
                      <XCircle className="h-4 w-4 text-secondary flex-shrink-0" />
                    )}
                    {upload.status === 'uploading' && (
                      <UploadCloud className="h-4 w-4 text-secondary animate-pulse flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium truncate">
                      {upload.file.name}
                    </span>
                  </div>

                  <span className="text-xs text-muted-foreground block mt-1">
                    {(upload.file.size / 1024 / 1024).toFixed(2)} MB •
                    {upload.status === 'uploading'
                      ? ' Uploading...'
                      : upload.status === 'success'
                      ? ' Uploaded'
                      : ' Failed'}
                  </span>

                  <Progress value={upload.progress} className="h-1.5 mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
