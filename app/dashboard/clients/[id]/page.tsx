'use client'
import { EditClientForm } from '@/app/api/clients/[id]/edit-client.form'
import { Card } from '@/components/card'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Example of how to use the EditClientForm component
export default function EditClientPage({
  params: { id }
}: {
  params: { id: string }
}) {
  const [isEditing, setIsEditing] = useState(false)
  const clientId = id
  const router = useRouter()

  const handleSuccess = (updatedClient: any) => {
    setIsEditing(false)
  }

  const handleCancel = () => {
    router.push('/dashboard/clients')
    setIsEditing(false)
  }

  return (
    <Card className="space-y-6">
      <div className="">
        <h1 className="text-2xl font-bold">Modifier le client</h1>
        <p className="text-muted-foreground">
          Modifiez les informations du client ci-dessous.
        </p>
      </div>

      <EditClientForm
        clientId={clientId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </Card>
  )
}
