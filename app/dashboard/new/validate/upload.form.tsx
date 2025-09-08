'use client'

import { DatePicker } from '@/components/date-picker'
import { Icons } from '@/components/icons'
import { useOrder } from '@/components/new-order.provider'
import { OrderUploader } from '@/components/order-uploader'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { Attachment, OrderItem } from '@/lib/validations'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Props {}

export const UploadForm: React.FC<Props> = ({}: Props) => {
  const { order, setOrder } = useOrder()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const [uploadedAttachments, setUploadedAttachments] = useState<Attachment[]>(
    order?.Attachments || []
  )

  // Initialize attachments from order
  useEffect(() => {
    if (order?.Attachments) {
      setUploadedAttachments(order.Attachments)
    }
  }, [order?.Attachments])

  // Handle when a new attachment is added
  function handleAttachmentAdded(attachment: Attachment) {
    // Add the new attachment to our state
    setUploadedAttachments((prev) => [...prev, attachment])

    // Update the order context
    setOrder((prev) => ({
      ...prev,
      Attachments: [...(prev?.Attachments || []), attachment]
    }))
  }

  // Handle when an attachment is deleted
  function handleAttachmentDeleted(fileId: string) {
    // Remove the deleted attachment from our state
    const updatedAttachments = uploadedAttachments.filter(
      (att) => att.id !== fileId
    )
    setUploadedAttachments(updatedAttachments)

    // Update the order context
    setOrder((prev) => ({
      ...prev,
      Attachments: updatedAttachments
    }))
  }

  async function handleSubmit(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> {
    event.preventDefault()

    if (!order) {
      toast({
        title: 'Erreur',
        description: 'Aucune commande à soumettre',
        variant: 'destructive'
      })
      return
    }

    if (!order.Client?.id && !order.clientId) {
      toast({
        title: 'Client manquant',
        description: 'Veuillez sélectionner un client pour cette commande',
        variant: 'destructive'
      })
      router.push('/dashboard/new')
      return
    }

    if (!order.OrderItems || order.OrderItems.length === 0) {
      toast({
        title: 'Articles manquants',
        description: 'Veuillez ajouter au moins un article à cette commande',
        variant: 'destructive'
      })
      router.push('/dashboard/new/order')
      return
    }

    setIsSubmitting(true)

    try {
      // Create the order
      const orderData = {
        id: order.id,
        clientId: order.Client?.id || order.clientId,
        deadline: order.deadline || new Date().toISOString(),
        state: 'PLANNED',
        progress: 0,
        Payment: order.Payment || null,
        totalItems: order.OrderItems?.length || 0, // Add total items
        deliveredItems: 0, // New orders start with 0 delivered
        OrderItems: order.OrderItems,
        Attachments: uploadedAttachments.map(
          ({ id, name, type, url, uniqueName }) => ({
            id,
            name,
            type,
            url,
            uniqueName: uniqueName || id
          })
        )
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || 'Échec de la création de la commande'
        )
      }

      const createdOrder = await response.json()

      toast({
        title: 'Commande validée',
        description: (
          <div>
            Votre commande a été validée. Vous pouvez aller à{' '}
            <Link
              href={`/dashboard/orders/${createdOrder?.id}`}
              className="text-blue-500 underline font-light"
            >
              {order?.id}
            </Link>{' '}
            pour consulter la commande.
          </div>
        ),
        variant: 'success'
      })

      // Reset order state
      setOrder(undefined)
    } catch (error) {
      console.error('Error creating order:', error)
      toast({
        title: 'Erreur',
        description:
          error instanceof Error
            ? error.message
            : 'Une erreur est survenue lors de la création de la commande',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="space-y-4
    "
    >
      <div className="relative border rounded-md px-3 pt-4 py-3">
        <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
          délais
        </span>
        <div className="flex flex-col gap-2">
          <Label className="capitalize">
            {' Délais estimé'}
            <span className="text-xs text-muted-foreground/50">
              {'(susceptible de changer)'}
            </span>
          </Label>
          <DatePicker
            date={order?.deadline || new Date().toISOString()}
            onDateChange={(v) =>
              setOrder((prev) => ({
                ...prev,
                deadline: v
              }))
            }
            locale={fr}
            placeholder="Choisir une date"
            formatStr="PPP"
          />
        </div>
      </div>

      <div className="relative space-y-3 border rounded-md p-3">
        <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
          pièces jointes
        </span>
        <Label className="capitalize">Joindre des fichiers</Label>
        <OrderUploader
          uploadPath={`orders/${order?.id || 'unknown'}`}
          initialAttachments={uploadedAttachments}
          onAttachmentAdded={handleAttachmentAdded}
          onAttachmentDeleted={handleAttachmentDeleted}
          isShowDestination
          maxFiles={10}
        />
      </div>
      <div className="flex flex-col items-end gap-4">
        <Separator />
        <div className="w-full flex justify-between">
          <Button
            onClick={(e) => {
              e.preventDefault()
              router.replace('payment')
            }}
            className={'min-w-28'}
            type="button"
            disabled={isSubmitting}
          >
            <Icons.arrowRight className="mr-2 w-4 text-secondary rotate-180" />
            {'Payment'}
          </Button>
          <Button
            className="min-w-28"
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                {'Traitement...'}
              </>
            ) : (
              <>
                {'Confirmer'}
                <Icons.check className="ml-2 w-4 text-secondary" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
