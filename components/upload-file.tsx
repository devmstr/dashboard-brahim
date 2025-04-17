'use client'
import { FileUploadArea } from '@/components/file-upload-area'
import { Icons } from '@/components/icons'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { CardGrid } from '@/components/card'
import { Label } from '@/components/ui/label'

interface Props {}

export const UploadFile: React.FC<Props> = ({}: Props) => {
  const router = useRouter()
  const [uploadCount, setUploadCount] = useState(0)

  // file upload section
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  // This function simulates file upload to a server
  const handleUpload = async (file: File) => {
    console.log('Uploading file:', file.name)

    // In a real application, you would create a FormData object
    // and send it to your server or API endpoint
    // const formData = new FormData()
    // formData.append('file', file)
    // const response = await fetch('/api/upload', { method: 'POST', body: formData })

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Simulate successful upload (90% of the time)
    const success = Math.random() > 0.1

    if (success) {
      setUploadedFiles((prev) => [...prev, file.name])
    }

    return {
      success,
      message: success
        ? `Uploaded ${file.name}`
        : `Failed ${file.name}. Server error.`,
      fileName: file.name
    }
  }

  return (
    <FileUploadArea
      className=""
      acceptedFileTypes=".pdf,.jpg,.jpeg,.png,.tiff"
      maxFileSizeMB={20}
      multiple={true}
      onUpload={handleUpload}
    />
  )
}
